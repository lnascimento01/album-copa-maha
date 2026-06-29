<?php

namespace App\Services\Pool;

use App\Models\PoolMatch;
use App\Models\PoolPrediction;
use App\Models\PoolSetting;
use App\Models\StickerPack;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use App\Services\Pool\BracketProgressionService;

class GradePoolMatchService
{
    public function __construct(
        private readonly BracketProgressionService $bracketProgression,
    ) {}

    /**
     * @return array{exact_count: int, winner_goals_count: int, total_packs_granted: int}
     */
    public function grade(PoolMatch $match, int $homeScore, int $awayScore, User $actor, ?string $penaltyWinner = null): array
    {
        return DB::transaction(function () use ($match, $homeScore, $awayScore, $actor, $penaltyWinner): array {
            if (! $match->canSetScore()) {
                throw new RuntimeException('Este jogo ainda não pode ter o placar definido.');
            }

            if ($match->hasScore()) {
                throw new RuntimeException('Este jogo já possui placar definido.');
            }

            $isDraw = $homeScore === $awayScore;

            if ($isDraw && $match->isKnockout() && $penaltyWinner === null) {
                throw new RuntimeException('Empate em fase eliminatória: informe quem avançou nos pênaltis.');
            }

            if ($penaltyWinner !== null && $penaltyWinner !== $match->home_team && $penaltyWinner !== $match->away_team) {
                throw new RuntimeException('O vencedor nos pênaltis deve ser um dos times da partida.');
            }

            $match->forceFill([
                'home_score'     => $homeScore,
                'away_score'     => $awayScore,
                'penalty_winner' => $isDraw ? $penaltyWinner : null,
                'score_set_by'   => $actor->id,
                'score_locked_at' => now(),
            ])->save();

            $settings = PoolSetting::current();

            if ($settings->album_id === null) {
                Log::warning('GradePoolMatchService: album_id não configurado no PoolSetting. Pacotes não serão distribuídos.', [
                    'pool_match_id' => $match->id,
                ]);

                return [
                    'exact_count' => 0,
                    'winner_goals_count' => 0,
                    'total_packs_granted' => 0,
                ];
            }

            $finalHomeWins = $homeScore > $awayScore;
            $finalAwayWins = $awayScore > $homeScore;
            $isDraw = $homeScore === $awayScore;

            $exactCount = 0;
            $winnerGoalsCount = 0;

            $predictions = PoolPrediction::query()
                ->where('match_id', $match->id)
                ->lockForUpdate()
                ->get();

            foreach ($predictions as $prediction) {
                $isExactScore = $prediction->home_score === $homeScore && $prediction->away_score === $awayScore;

                if ($isExactScore && ! $prediction->exact_score_rewarded) {
                    StickerPack::query()->create([
                        'user_id' => $prediction->user_id,
                        'album_id' => $settings->album_id,
                        'granted_by' => $actor->id,
                        'source' => StickerPack::SOURCE_POOL,
                        'status' => StickerPack::STATUS_PENDING,
                        'size' => $settings->exact_score_pack_size,
                        'metadata' => [
                            'pool_match_id' => $match->id,
                            'prize_type' => 'exact_score',
                        ],
                    ]);

                    $prediction->forceFill(['exact_score_rewarded' => true])->save();
                    $exactCount++;
                }

                // The winner-goals prize and the exact-score prize are mutually exclusive:
                // an exact score already implies the winner's goals were guessed, so it would
                // otherwise grant both packs. Exact score takes precedence; the winner-goals
                // prize is only awarded when the exact score was NOT hit.
                if (! $isExactScore && ! $isDraw && ! $prediction->winner_goals_rewarded) {
                    $predHomeWins = $prediction->home_score > $prediction->away_score;
                    $predAwayWins = $prediction->away_score > $prediction->home_score;

                    $winnerGoalsHit = false;

                    if ($finalHomeWins && $predHomeWins && $prediction->home_score === $homeScore) {
                        $winnerGoalsHit = true;
                    } elseif ($finalAwayWins && $predAwayWins && $prediction->away_score === $awayScore) {
                        $winnerGoalsHit = true;
                    }

                    if ($winnerGoalsHit) {
                        StickerPack::query()->create([
                            'user_id' => $prediction->user_id,
                            'album_id' => $settings->album_id,
                            'granted_by' => $actor->id,
                            'source' => StickerPack::SOURCE_POOL,
                            'status' => StickerPack::STATUS_PENDING,
                            'size' => $settings->winner_goals_pack_size,
                            'metadata' => [
                                'pool_match_id' => $match->id,
                                'prize_type' => 'winner_goals',
                            ],
                        ]);

                        $prediction->forceFill(['winner_goals_rewarded' => true])->save();
                        $winnerGoalsCount++;
                    }
                }
            }

            if ($match->isKnockout()) {
                $finalHomeWins = $homeScore > $awayScore;
                $winner = $finalHomeWins ? $match->home_team : ($isDraw ? $penaltyWinner : $match->away_team);
                $loser  = $winner === $match->home_team ? $match->away_team : $match->home_team;

                $this->bracketProgression->advance($match, $winner, $loser);
            }

            return [
                'exact_count' => $exactCount,
                'winner_goals_count' => $winnerGoalsCount,
                'total_packs_granted' => $exactCount + $winnerGoalsCount,
            ];
        });
    }
}
