<?php

namespace App\Http\Controllers;

use App\Models\Achievement;
use App\Models\User;
use App\Services\Achievements\EvaluateUserAchievementsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AchievementController extends Controller
{
    public function __construct(private readonly EvaluateUserAchievementsService $evaluateUserAchievementsService) {}

    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        abort_unless($user->hasPermission('achievements.viewOwn'), 403);

        $evaluation = $this->evaluateUserAchievementsService->evaluate($user);
        $album = $evaluation['album'];
        $metrics = $evaluation['metrics'];

        if (! $album) {
            return Inertia::render('achievements/index', [
                'album' => null,
                'unlocked' => [],
                'locked' => [],
                'metrics' => $metrics,
            ]);
        }

        $achievements = Achievement::query()
            ->where('is_active', true)
            ->where(function ($query) use ($album) {
                $query->whereNull('team_id')
                    ->orWhere('team_id', $album->team_id);
            })
            ->where(function ($query) use ($album) {
                $query->whereNull('album_id')
                    ->orWhere('album_id', $album->id);
            })
            ->with(['userAchievements' => fn ($query) => $query->where('user_id', $user->id)->where(function ($inner) use ($album) {
                $inner->whereNull('album_id')->orWhere('album_id', $album->id);
            })])
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $mapped = $achievements->map(function (Achievement $achievement) use ($metrics): array {
            $unlocked = $achievement->userAchievements->first();
            $progressValue = $this->resolveProgressValue($achievement, $metrics);
            $threshold = (int) ($achievement->threshold ?? 0);
            $progressPercent = $threshold > 0
                ? min(100, (int) floor(($progressValue / $threshold) * 100))
                : 0;

            return [
                'id' => $achievement->id,
                'name' => $achievement->name,
                'slug' => $achievement->slug,
                'description' => $achievement->description,
                'type' => $achievement->type,
                'threshold' => $achievement->threshold,
                'icon' => $achievement->icon,
                'color' => $achievement->color,
                'is_unlocked' => $unlocked !== null,
                'unlocked_at' => optional($unlocked?->unlocked_at)?->toDateTimeString(),
                'progress_value' => $progressValue,
                'progress_percent' => $progressPercent,
            ];
        });

        return Inertia::render('achievements/index', [
            'album' => [
                'id' => $album->id,
                'name' => $album->name,
                'slug' => $album->slug,
                'season' => $album->season,
            ],
            'metrics' => $metrics,
            'unlocked' => $mapped->where('is_unlocked', true)->values()->all(),
            'locked' => $mapped->where('is_unlocked', false)->values()->all(),
            'newlyUnlockedCount' => count($evaluation['unlocked']),
        ]);
    }

    /**
     * @param  array<string, int>  $metrics
     */
    private function resolveProgressValue(Achievement $achievement, array $metrics): int
    {
        return match ($achievement->type) {
            Achievement::TYPE_ALBUM_PROGRESS => $metrics['album_progress_percent'],
            Achievement::TYPE_STICKERS_UNLOCKED => $metrics['stickers_unlocked'],
            Achievement::TYPE_PACKS_OPENED => $metrics['packs_opened'],
            Achievement::TYPE_CHECKINS_CONFIRMED => $metrics['checkins_confirmed'],
            Achievement::TYPE_REWARD_CODES_REDEEMED => $metrics['reward_codes_redeemed'],
            Achievement::TYPE_SOCIAL_MISSIONS_APPROVED => $metrics['social_missions_approved'],
            default => 0,
        };
    }
}
