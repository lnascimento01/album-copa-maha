<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SetPoolMatchScoreRequest;
use App\Http\Requests\UpdatePoolSettingsRequest;
use App\Models\Album;
use App\Models\PoolMatch;
use App\Models\PoolPrediction;
use App\Models\PoolSetting;
use App\Services\Pool\GradePoolMatchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class PoolController extends Controller
{
    public function __construct(
        private readonly GradePoolMatchService $gradeService,
    ) {}

    public function index(): Response
    {
        $this->authorize('manage', PoolMatch::class);

        $settings = PoolSetting::current();

        $matches = PoolMatch::query()
            ->withCount([
                'predictions',
                // Predictions that won any prize (exact score OR winner goals).
                'predictions as winners_count' => fn ($query) => $query
                    ->where('exact_score_rewarded', true)
                    ->orWhere('winner_goals_rewarded', true),
            ])
            ->orderBy('starts_at')
            ->get()
            ->map(fn (PoolMatch $match): array => [
                'id' => $match->id,
                'match_number' => $match->match_number,
                'stage' => $match->stage,
                'group_name' => $match->group_name,
                'home_team' => $match->home_team,
                'away_team' => $match->away_team,
                'starts_at' => $match->starts_at->toDateTimeString(),
                'city' => $match->city,
                'home_score' => $match->home_score,
                'away_score' => $match->away_score,
                'penalty_winner' => $match->penalty_winner,
                'score_locked_at' => optional($match->score_locked_at)?->toDateTimeString(),
                'predictions_count' => $match->predictions_count,
                'winners_count' => $match->winners_count,
                'can_set_score' => $match->canSetScore(),
            ])
            ->values()
            ->all();

        $albums = Album::query()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/pool/index', [
            'matches' => $matches,
            'settings' => [
                'is_active' => $settings->is_active,
                'album_id' => $settings->album_id,
                'exact_score_pack_size' => $settings->exact_score_pack_size,
                'winner_goals_pack_size' => $settings->winner_goals_pack_size,
            ],
            'albums' => $albums->map(fn ($album) => ['id' => $album->id, 'name' => $album->name])->values()->all(),
        ]);
    }

    public function updateSettings(UpdatePoolSettingsRequest $request): RedirectResponse
    {
        $this->authorize('manage', PoolMatch::class);

        $settings = PoolSetting::current();

        $settings->fill([
            ...$request->validated(),
            'updated_by' => $request->user()?->id,
        ])->save();

        return back()->with('success', 'Configurações do bolão atualizadas com sucesso.');
    }

    public function setScore(SetPoolMatchScoreRequest $request, PoolMatch $poolMatch): RedirectResponse
    {
        $this->authorize('manage', PoolMatch::class);

        try {
            $result = $this->gradeService->grade(
                $poolMatch,
                $request->validated('home_score'),
                $request->validated('away_score'),
                $request->user(),
                $request->validated('penalty_winner'),
            );
        } catch (RuntimeException $exception) {
            return back()->withErrors(['score' => $exception->getMessage()]);
        }

        return back()->with(
            'success',
            sprintf(
                'Placar definido. Pacotes distribuídos: %d (exatos: %d, gols vencedor: %d).',
                $result['total_packs_granted'],
                $result['exact_count'],
                $result['winner_goals_count'],
            ),
        );
    }

    public function predictions(PoolMatch $poolMatch): JsonResponse
    {
        $this->authorize('manage', PoolMatch::class);

        $predictions = $poolMatch->predictions()
            ->with('user:id,name,email')
            ->orderByDesc('exact_score_rewarded')
            ->orderByDesc('winner_goals_rewarded')
            ->orderBy('id')
            ->get()
            ->map(fn (PoolPrediction $prediction): array => [
                'id' => $prediction->id,
                'user_name' => $prediction->user?->name ?? '—',
                'user_email' => $prediction->user?->email,
                'home_score' => $prediction->home_score,
                'away_score' => $prediction->away_score,
                'exact_score_rewarded' => $prediction->exact_score_rewarded,
                'winner_goals_rewarded' => $prediction->winner_goals_rewarded,
                'created_at' => optional($prediction->created_at)?->toDateTimeString(),
                'updated_at' => optional($prediction->updated_at)?->toDateTimeString(),
            ])
            ->values()
            ->all();

        return response()->json(['predictions' => $predictions]);
    }
}
