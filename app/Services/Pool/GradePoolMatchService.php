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

class GradePoolMatchService
{
    /**
     * @return array{exact_count: int, winner_goals_count: int, total_packs_granted: int}
     */
    public function grade(PoolMatch $match, int $homeScore, int $awayScore, User $actor): array
    {
        return DB::transaction(function () use ($match, $homeScore, $awayScore, $actor): array {
            if (! $match->canSetScore()) {
                throw new RuntimeException('Este jogo ainda não pode ter o placar definido.');
            }

            if ($match->hasScore()) {
                throw new RuntimeException('Este jogo já possui placar definido.');
            }

            $match->forceFill([
                'home_score' => $homeScore,
                'away_score' => $awayScore,
                'score_set_by' => $actor->id,
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

                if (! $isDraw && ! $prediction->winner_goals_rewarded) {
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

            return [
                'exact_count' => $exactCount,
                'winner_goals_count' => $winnerGoalsCount,
                'total_packs_granted' => $exactCount + $winnerGoalsCount,
            ];
        });
    }
}
