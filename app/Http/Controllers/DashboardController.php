<?php

namespace App\Http\Controllers;

use App\Models\ActivityCheckin;
use App\Models\AuditLog;
use App\Models\RewardCode;
use App\Models\RewardCodeRedemption;
use App\Models\ShareCard;
use App\Models\SocialMissionSubmission;
use App\Models\StickerPack;
use App\Models\User;
use App\Models\UserAchievement;
use App\Services\Achievements\EvaluateUserAchievementsService;
use App\Services\Rankings\BuildAlbumRankingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly EvaluateUserAchievementsService $evaluateUserAchievementsService,
        private readonly BuildAlbumRankingService $buildAlbumRankingService,
    ) {}

    public function __invoke(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->isAdmin()) {
            $recentAuditLogs = AuditLog::query()
                ->with(['actor:id,name,email', 'target:id,name,email'])
                ->orderByDesc('created_at')
                ->limit(8)
                ->get()
                ->map(fn (AuditLog $log): array => [
                    'id' => $log->id,
                    'action' => $log->action,
                    'actor' => $log->actor ? [
                        'id' => $log->actor->id,
                        'name' => $log->actor->name,
                        'email' => $log->actor->email,
                    ] : null,
                    'target' => $log->target ? [
                        'id' => $log->target->id,
                        'name' => $log->target->name,
                        'email' => $log->target->email,
                    ] : null,
                    'created_at' => optional($log->created_at)?->toIso8601String(),
                ])
                ->values();

            return Inertia::render('dashboard', [
                'mode' => 'admin',
                'stats' => [
                    'pendingUsers' => User::query()->where('approval_status', User::APPROVAL_PENDING)->count(),
                    'approvedUsers' => User::query()->where('approval_status', User::APPROVAL_APPROVED)->count(),
                    'activeRewardCodes' => RewardCode::query()->where('status', RewardCode::STATUS_ACTIVE)->count(),
                    'recentRedemptions' => RewardCodeRedemption::query()->where('redeemed_at', '>=', now()->subDays(7))->count(),
                    'pendingSocialSubmissions' => SocialMissionSubmission::query()->where('status', SocialMissionSubmission::STATUS_PENDING)->count(),
                ],
                'recentAuditLogs' => $recentAuditLogs,
            ]);
        }

        try {
            $this->evaluateUserAchievementsService->evaluate($user);
        } catch (\Throwable) {
            // Non-critical side effect: do not block dashboard.
        }

        $ranking = $this->buildAlbumRankingService->build(includeAdmins: false);
        $myRank = $ranking['rows']->firstWhere('user_id', $user->id);

        $recentCards = ShareCard::query()
            ->where('user_id', $user->id)
            ->orderByDesc('id')
            ->limit(5)
            ->get()
            ->map(fn (ShareCard $card): array => [
                'id' => $card->id,
                'type' => $card->type,
                'title' => $card->title,
                'subtitle' => $card->subtitle,
                'created_at' => optional($card->created_at)?->toDateTimeString(),
            ])
            ->values()
            ->all();

        return Inertia::render('dashboard', [
            'mode' => 'participant',
            'approvalStatus' => $user->approval_status,
            'permissions' => $user->permissions()->pluck('slug')->values()->all(),
            'stats' => [
                'checkins' => ActivityCheckin::query()->where('user_id', $user->id)->count(),
                'pendingPacks' => StickerPack::query()->where('user_id', $user->id)->where('status', StickerPack::STATUS_PENDING)->count(),
                'redeemedCodes' => RewardCodeRedemption::query()->where('user_id', $user->id)->count(),
                'missionsPending' => SocialMissionSubmission::query()->where('user_id', $user->id)->where('status', SocialMissionSubmission::STATUS_PENDING)->count(),
                'missionsApproved' => SocialMissionSubmission::query()->where('user_id', $user->id)->where('status', SocialMissionSubmission::STATUS_APPROVED)->count(),
                'achievementsUnlocked' => UserAchievement::query()->where('user_id', $user->id)->count(),
                'rankingPosition' => $myRank['position'] ?? null,
                'rankingScore' => $myRank['score'] ?? null,
            ],
            'profile' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'recentShareCards' => $recentCards,
        ]);
    }
}
