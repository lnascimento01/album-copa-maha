<?php

use App\Http\Controllers\AchievementController;
use App\Http\Controllers\DeployWebhookController;
use App\Http\Controllers\ActivityHistoryController;
use App\Http\Controllers\Admin\AchievementController as AdminAchievementController;
use App\Http\Controllers\Admin\ActivityCheckinController as AdminActivityCheckinController;
use App\Http\Controllers\Admin\ActivityCheckinSessionController as AdminActivityCheckinSessionController;
use App\Http\Controllers\Admin\ActivityController;
use App\Http\Controllers\Admin\AlbumController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\PlayerController;
use App\Http\Controllers\Admin\RankingController as AdminRankingController;
use App\Http\Controllers\Admin\RewardCodeController as AdminRewardCodeController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\ShareCardController as AdminShareCardController;
use App\Http\Controllers\Admin\PushNotificationController as AdminPushNotificationController;
use App\Http\Controllers\Admin\SocialMissionController as AdminSocialMissionController;
use App\Http\Controllers\Admin\SocialMissionSubmissionController as AdminSocialMissionSubmissionController;
use App\Http\Controllers\Admin\StickerController;
use App\Http\Controllers\Admin\StickerPackController as AdminStickerPackController;
use App\Http\Controllers\Admin\TeamController;
use App\Http\Controllers\Admin\UserApprovalController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\UserStickerResetController;
use App\Http\Controllers\AlbumCollectionController;
use App\Http\Controllers\ApprovalScreenController;
use App\Http\Controllers\ApprovalStatusController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EventCheckinController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\RankingController;
use App\Http\Controllers\RewardCodeRedemptionController;
use App\Http\Controllers\SelfCheckinController;
use App\Http\Controllers\ShareCardController;
use App\Http\Controllers\SocialMissionController;
use App\Http\Controllers\SocialMissionSubmissionController;
use App\Http\Controllers\StickerPackController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Http\Controllers\NewPasswordController;
use Laravel\Fortify\Http\Controllers\PasswordResetLinkController;
use Laravel\Fortify\Http\Controllers\RegisteredUserController;

Route::post('/webhook/deploy', [DeployWebhookController::class, 'handle'])
    ->middleware('throttle:5,1')
    ->name('webhook.deploy');

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }

    return redirect()->route('login');
})->name('home');

Route::middleware(['guest'])->group(function () {
    Route::post('/register', [RegisteredUserController::class, 'store'])
        ->middleware('throttle:register')
        ->name('register.store');

    Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])
        ->middleware('throttle:password-reset-request')
        ->name('password.email');

    Route::post('/reset-password', [NewPasswordController::class, 'store'])
        ->middleware('throttle:password-reset-update')
        ->name('password.update');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/approval/pending', [ApprovalScreenController::class, 'pending'])->name('approval.pending');
    Route::get('/approval/rejected', [ApprovalScreenController::class, 'rejected'])->name('approval.rejected');
    Route::get('/approval/suspended', [ApprovalScreenController::class, 'suspended'])->name('approval.suspended');
    Route::get('/approval/status', ApprovalStatusController::class)->name('approval.status');

    Route::get('/dashboard', DashboardController::class)
        ->middleware('approved')
        ->name('dashboard');

    Route::post('/onboarding/tour/{tour}/complete', [OnboardingController::class, 'complete'])
        ->middleware('approved')
        ->name('onboarding.tour.complete');

    Route::get('/album', [AlbumCollectionController::class, 'index'])
        ->middleware(['approved', 'permission:albumCollection.viewOwn'])
        ->name('album.index');

    Route::get('/album/stickers/{sticker}', [AlbumCollectionController::class, 'show'])
        ->middleware(['approved', 'permission:albumCollection.viewOwn'])
        ->name('album.stickers.show');

    Route::get('/packs', [StickerPackController::class, 'index'])
        ->middleware(['approved', 'permission:stickerPacks.viewOwn'])
        ->name('packs.index');

    Route::get('/packs/{stickerPack}', [StickerPackController::class, 'show'])
        ->middleware(['approved', 'permission:stickerPacks.viewOwn'])
        ->name('packs.show');

    Route::post('/packs/{stickerPack}/open', [StickerPackController::class, 'open'])
        ->middleware(['approved', 'permission:stickerPacks.openOwn'])
        ->name('packs.open');

    Route::get('/checkins', [ActivityHistoryController::class, 'index'])
        ->middleware(['approved', 'permission:activityCheckins.viewOwn'])
        ->name('checkins.index');

    Route::get('/checkins/{activityCheckin}', [ActivityHistoryController::class, 'show'])
        ->middleware(['approved', 'permission:activityCheckins.viewOwn'])
        ->name('checkins.show');

    Route::get('/checkin/event/{token}', [EventCheckinController::class, 'showByToken'])
        ->middleware(['approved', 'permission:activityCheckins.selfCreate'])
        ->name('checkin.event.show');

    Route::post('/checkin/event/{token}/confirm', [EventCheckinController::class, 'confirmByToken'])
        ->middleware(['approved', 'permission:activityCheckins.selfCreate', 'throttle:event-checkin-confirm'])
        ->name('checkin.event.confirm');

    Route::get('/checkin/{token}', [SelfCheckinController::class, 'showByToken'])
        ->middleware(['approved', 'permission:activityCheckins.selfCreate'])
        ->name('checkin.token.show');

    Route::post('/checkin/{token}/confirm', [SelfCheckinController::class, 'confirmByToken'])
        ->middleware(['approved', 'permission:activityCheckins.selfCreate'])
        ->name('checkin.token.confirm');

    Route::get('/checkin-code', [SelfCheckinController::class, 'showByCodeForm'])
        ->middleware(['approved', 'permission:activityCheckins.selfCreate'])
        ->name('checkin.code.form');

    Route::post('/checkin-code', [SelfCheckinController::class, 'confirmByCode'])
        ->middleware(['approved', 'permission:activityCheckins.selfCreate'])
        ->name('checkin.code.confirm');

    Route::get('/reward-code', [RewardCodeRedemptionController::class, 'index'])
        ->middleware(['approved', 'permission:rewardCodes.redeemOwn'])
        ->name('reward-code.index');

    Route::post('/reward-code', [RewardCodeRedemptionController::class, 'store'])
        ->middleware(['approved', 'permission:rewardCodes.redeemOwn'])
        ->name('reward-code.store');

    Route::get('/reward-codes/history', [RewardCodeRedemptionController::class, 'history'])
        ->middleware(['approved', 'permission:rewardCodeRedemptions.viewOwn'])
        ->name('reward-codes.history');

    Route::get('/social-missions', [SocialMissionController::class, 'index'])
        ->middleware(['approved', 'permission:socialMissionSubmissions.createOwn'])
        ->name('social-missions.index');

    Route::get('/social-missions/{socialMission}', [SocialMissionController::class, 'show'])
        ->middleware(['approved', 'permission:socialMissionSubmissions.createOwn'])
        ->name('social-missions.show');

    Route::post('/social-missions/{socialMission}/submissions', [SocialMissionSubmissionController::class, 'store'])
        ->middleware(['approved', 'permission:socialMissionSubmissions.createOwn'])
        ->name('social-missions.submissions.store');

    Route::get('/social-submissions', [SocialMissionSubmissionController::class, 'index'])
        ->middleware(['approved', 'permission:socialMissionSubmissions.viewOwn'])
        ->name('social-submissions.index');

    Route::get('/social-submissions/{submission}', [SocialMissionSubmissionController::class, 'show'])
        ->middleware(['approved', 'permission:socialMissionSubmissions.viewOwn'])
        ->name('social-submissions.show');

    Route::get('/ranking', [RankingController::class, 'index'])
        ->middleware(['approved', 'permission:rankings.view'])
        ->name('ranking.index');

    Route::get('/achievements', [AchievementController::class, 'index'])
        ->middleware(['approved', 'permission:achievements.viewOwn'])
        ->name('achievements.index');

    Route::get('/share-cards', [ShareCardController::class, 'index'])
        ->middleware(['approved', 'permission:shareCards.viewOwn'])
        ->name('share-cards.index');

    Route::post('/share-cards', [ShareCardController::class, 'store'])
        ->middleware(['approved', 'permission:shareCards.createOwn'])
        ->name('share-cards.store');

    Route::get('/share-cards/{shareCard}', [ShareCardController::class, 'show'])
        ->middleware(['approved', 'permission:shareCards.viewOwn'])
        ->name('share-cards.show');

    Route::prefix('/admin')->name('admin.')->middleware('approved')->group(function () {
        Route::get('/rankings', [AdminRankingController::class, 'index'])
            ->middleware('permission:rankings.viewAny')
            ->name('rankings.index');

        Route::get('/achievements', [AdminAchievementController::class, 'index'])
            ->middleware('permission:achievements.viewAny')
            ->name('achievements.index');

        Route::get('/achievements/create', [AdminAchievementController::class, 'create'])
            ->middleware('permission:achievements.create')
            ->name('achievements.create');

        Route::post('/achievements', [AdminAchievementController::class, 'store'])
            ->middleware('permission:achievements.create')
            ->name('achievements.store');

        Route::get('/achievements/{achievement}', [AdminAchievementController::class, 'show'])
            ->middleware('permission:achievements.view')
            ->name('achievements.show');

        Route::get('/achievements/{achievement}/edit', [AdminAchievementController::class, 'edit'])
            ->middleware('permission:achievements.update')
            ->name('achievements.edit');

        Route::patch('/achievements/{achievement}', [AdminAchievementController::class, 'update'])
            ->middleware('permission:achievements.update')
            ->name('achievements.update');

        Route::post('/achievements/{achievement}/grant', [AdminAchievementController::class, 'grant'])
            ->middleware('permission:achievements.grant')
            ->name('achievements.grant');

        Route::get('/share-cards', [AdminShareCardController::class, 'index'])
            ->middleware('permission:shareCards.viewAny')
            ->name('share-cards.index');

        Route::get('/share-cards/{shareCard}', [AdminShareCardController::class, 'show'])
            ->middleware('permission:shareCards.viewAny')
            ->name('share-cards.show');

        Route::get('/activities', [ActivityController::class, 'index'])
            ->middleware('permission:activities.viewAny')
            ->name('activities.index');

        Route::get('/activities/create', [ActivityController::class, 'create'])
            ->middleware('permission:activities.create')
            ->name('activities.create');

        Route::post('/activities', [ActivityController::class, 'store'])
            ->middleware('permission:activities.create')
            ->name('activities.store');

        Route::get('/activities/{activity}', [ActivityController::class, 'show'])
            ->middleware('permission:activities.view')
            ->name('activities.show');

        Route::get('/activities/{activity}/edit', [ActivityController::class, 'edit'])
            ->middleware('permission:activities.update')
            ->name('activities.edit');

        Route::patch('/activities/{activity}', [ActivityController::class, 'update'])
            ->middleware('permission:activities.update')
            ->name('activities.update');

        Route::patch('/activities/{activity}/open', [ActivityController::class, 'open'])
            ->middleware('permission:activities.open')
            ->name('activities.open');

        Route::patch('/activities/{activity}/close', [ActivityController::class, 'close'])
            ->middleware('permission:activities.close')
            ->name('activities.close');

        Route::patch('/activities/{activity}/cancel', [ActivityController::class, 'cancel'])
            ->middleware('permission:activities.cancel')
            ->name('activities.cancel');

        Route::post('/activities/{activity}/checkins', [AdminActivityCheckinController::class, 'store'])
            ->middleware('permission:activityCheckins.create')
            ->name('activities.checkins.store');

        Route::post('/activities/{activity}/checkin-sessions', [AdminActivityCheckinSessionController::class, 'store'])
            ->middleware('permission:activityCheckinSessions.create')
            ->name('activities.checkin-sessions.store');

        Route::patch('/activity-checkin-sessions/{session}/revoke', [AdminActivityCheckinSessionController::class, 'revoke'])
            ->middleware('permission:activityCheckinSessions.revoke')
            ->name('activity-checkin-sessions.revoke');

        Route::patch('/activity-checkins/{activityCheckin}/revoke', [AdminActivityCheckinController::class, 'revoke'])
            ->middleware('permission:activityCheckins.revoke')
            ->name('activity-checkins.revoke');

        Route::get('/reward-codes', [AdminRewardCodeController::class, 'index'])
            ->middleware('permission:rewardCodes.viewAny')
            ->name('reward-codes.index');

        Route::get('/reward-codes/create', [AdminRewardCodeController::class, 'create'])
            ->middleware('permission:rewardCodes.create')
            ->name('reward-codes.create');

        Route::post('/reward-codes', [AdminRewardCodeController::class, 'store'])
            ->middleware('permission:rewardCodes.create')
            ->name('reward-codes.store');

        Route::get('/reward-codes/{rewardCode}', [AdminRewardCodeController::class, 'show'])
            ->middleware('permission:rewardCodes.view')
            ->name('reward-codes.show');

        Route::get('/reward-codes/{rewardCode}/edit', [AdminRewardCodeController::class, 'edit'])
            ->middleware('permission:rewardCodes.update')
            ->name('reward-codes.edit');

        Route::patch('/reward-codes/{rewardCode}', [AdminRewardCodeController::class, 'update'])
            ->middleware('permission:rewardCodes.update')
            ->name('reward-codes.update');

        Route::patch('/reward-codes/{rewardCode}/activate', [AdminRewardCodeController::class, 'activate'])
            ->middleware('permission:rewardCodes.activate')
            ->name('reward-codes.activate');

        Route::patch('/reward-codes/{rewardCode}/revoke', [AdminRewardCodeController::class, 'revoke'])
            ->middleware('permission:rewardCodes.revoke')
            ->name('reward-codes.revoke');

        Route::get('/social-missions', [AdminSocialMissionController::class, 'index'])
            ->middleware('permission:socialMissions.viewAny')
            ->name('social-missions.index');

        Route::get('/social-missions/create', [AdminSocialMissionController::class, 'create'])
            ->middleware('permission:socialMissions.create')
            ->name('social-missions.create');

        Route::post('/social-missions', [AdminSocialMissionController::class, 'store'])
            ->middleware('permission:socialMissions.create')
            ->name('social-missions.store');

        Route::get('/social-missions/{socialMission}', [AdminSocialMissionController::class, 'show'])
            ->middleware('permission:socialMissions.view')
            ->name('social-missions.show');

        Route::get('/social-missions/{socialMission}/edit', [AdminSocialMissionController::class, 'edit'])
            ->middleware('permission:socialMissions.update')
            ->name('social-missions.edit');

        Route::patch('/social-missions/{socialMission}', [AdminSocialMissionController::class, 'update'])
            ->middleware('permission:socialMissions.update')
            ->name('social-missions.update');

        Route::patch('/social-missions/{socialMission}/activate', [AdminSocialMissionController::class, 'activate'])
            ->middleware('permission:socialMissions.activate')
            ->name('social-missions.activate');

        Route::patch('/social-missions/{socialMission}/close', [AdminSocialMissionController::class, 'close'])
            ->middleware('permission:socialMissions.close')
            ->name('social-missions.close');

        Route::patch('/social-missions/{socialMission}/cancel', [AdminSocialMissionController::class, 'cancel'])
            ->middleware('permission:socialMissions.cancel')
            ->name('social-missions.cancel');

        Route::get('/social-mission-submissions', [AdminSocialMissionSubmissionController::class, 'index'])
            ->middleware('permission:socialMissionSubmissions.viewAny')
            ->name('social-mission-submissions.index');

        Route::get('/social-mission-submissions/{submission}', [AdminSocialMissionSubmissionController::class, 'show'])
            ->middleware('permission:socialMissionSubmissions.viewAny')
            ->name('social-mission-submissions.show');

        Route::patch('/social-mission-submissions/{submission}/approve', [AdminSocialMissionSubmissionController::class, 'approve'])
            ->middleware('permission:socialMissionSubmissions.approve')
            ->name('social-mission-submissions.approve');

        Route::patch('/social-mission-submissions/{submission}/reject', [AdminSocialMissionSubmissionController::class, 'reject'])
            ->middleware('permission:socialMissionSubmissions.reject')
            ->name('social-mission-submissions.reject');

        Route::get('/sticker-packs', [AdminStickerPackController::class, 'index'])
            ->middleware('permission:stickerPacks.viewAny')
            ->name('sticker-packs.index');

        Route::get('/sticker-packs/create', [AdminStickerPackController::class, 'create'])
            ->middleware('permission:stickerPacks.create')
            ->name('sticker-packs.create');

        Route::post('/sticker-packs', [AdminStickerPackController::class, 'store'])
            ->middleware('permission:stickerPacks.create')
            ->name('sticker-packs.store');

        Route::get('/sticker-packs/{stickerPack}', [AdminStickerPackController::class, 'show'])
            ->middleware('permission:stickerPacks.view')
            ->name('sticker-packs.show');

        Route::patch('/sticker-packs/{stickerPack}/cancel', [AdminStickerPackController::class, 'cancel'])
            ->middleware('permission:stickerPacks.cancel')
            ->name('sticker-packs.cancel');

        Route::delete('/sticker-packs/{stickerPack}', [AdminStickerPackController::class, 'revoke'])
            ->middleware('permission:stickerPacks.revoke')
            ->name('sticker-packs.revoke');

        Route::get('/teams', [TeamController::class, 'index'])
            ->middleware('permission:teams.viewAny')
            ->name('teams.index');

        Route::get('/teams/create', [TeamController::class, 'create'])
            ->middleware('permission:teams.create')
            ->name('teams.create');

        Route::post('/teams', [TeamController::class, 'store'])
            ->middleware('permission:teams.create')
            ->name('teams.store');

        Route::get('/teams/{team}', [TeamController::class, 'show'])
            ->middleware('permission:teams.view')
            ->name('teams.show');

        Route::get('/teams/{team}/edit', [TeamController::class, 'edit'])
            ->middleware('permission:teams.update')
            ->name('teams.edit');

        Route::patch('/teams/{team}', [TeamController::class, 'update'])
            ->middleware('permission:teams.update')
            ->name('teams.update');

        Route::get('/albums', [AlbumController::class, 'index'])
            ->middleware('permission:albums.viewAny')
            ->name('albums.index');

        Route::get('/albums/create', [AlbumController::class, 'create'])
            ->middleware('permission:albums.create')
            ->name('albums.create');

        Route::post('/albums', [AlbumController::class, 'store'])
            ->middleware('permission:albums.create')
            ->name('albums.store');

        Route::get('/albums/{album}', [AlbumController::class, 'show'])
            ->middleware('permission:albums.view')
            ->name('albums.show');

        Route::get('/albums/{album}/edit', [AlbumController::class, 'edit'])
            ->middleware('permission:albums.update')
            ->name('albums.edit');

        Route::patch('/albums/{album}', [AlbumController::class, 'update'])
            ->middleware('permission:albums.update')
            ->name('albums.update');

        Route::patch('/albums/{album}/publish', [AlbumController::class, 'publish'])
            ->middleware('permission:albums.publish')
            ->name('albums.publish');

        Route::patch('/albums/{album}/archive', [AlbumController::class, 'archive'])
            ->middleware('permission:albums.archive')
            ->name('albums.archive');

        Route::get('/players', [PlayerController::class, 'index'])
            ->middleware('permission:players.viewAny')
            ->name('players.index');

        Route::get('/players/create', [PlayerController::class, 'create'])
            ->middleware('permission:players.create')
            ->name('players.create');

        Route::post('/players', [PlayerController::class, 'store'])
            ->middleware('permission:players.create')
            ->name('players.store');

        Route::get('/players/{player}', [PlayerController::class, 'show'])
            ->middleware('permission:players.view')
            ->name('players.show');

        Route::get('/players/{player}/edit', [PlayerController::class, 'edit'])
            ->middleware('permission:players.update')
            ->name('players.edit');

        Route::patch('/players/{player}', [PlayerController::class, 'update'])
            ->middleware('permission:players.update')
            ->name('players.update');

        Route::get('/stickers', [StickerController::class, 'index'])
            ->middleware('permission:stickers.viewAny')
            ->name('stickers.index');

        Route::get('/stickers/create', [StickerController::class, 'create'])
            ->middleware('permission:stickers.create')
            ->name('stickers.create');

        Route::post('/stickers', [StickerController::class, 'store'])
            ->middleware('permission:stickers.create')
            ->name('stickers.store');

        Route::get('/stickers/{sticker}', [StickerController::class, 'show'])
            ->middleware('permission:stickers.view')
            ->name('stickers.show');

        Route::get('/stickers/{sticker}/edit', [StickerController::class, 'edit'])
            ->middleware('permission:stickers.update')
            ->name('stickers.edit');

        Route::patch('/stickers/{sticker}', [StickerController::class, 'update'])
            ->middleware('permission:stickers.update')
            ->name('stickers.update');

        Route::get('/users', [UserController::class, 'index'])
            ->middleware('permission:users.viewAny')
            ->name('users.index');

        Route::get('/users/{user}', [UserController::class, 'show'])
            ->middleware('permission:users.view')
            ->name('users.show');

        Route::match(['post', 'patch'], '/users/{user}/approve', [UserApprovalController::class, 'approve'])
            ->middleware('permission:users.approve')
            ->name('users.approve');

        Route::match(['post', 'patch'], '/users/{user}/reject', [UserApprovalController::class, 'reject'])
            ->middleware('permission:users.reject')
            ->name('users.reject');

        Route::match(['post', 'patch'], '/users/{user}/suspend', [UserApprovalController::class, 'suspend'])
            ->middleware('permission:users.update')
            ->name('users.suspend');

        Route::delete('/users/{user}/stickers/reset', UserStickerResetController::class)
            ->middleware('permission:users.resetStickers')
            ->name('users.stickers.reset');

        Route::get('/roles', [RoleController::class, 'index'])
            ->middleware('permission:roles.viewAny')
            ->name('roles.index');

        Route::patch('/roles/{role}/permissions', [RoleController::class, 'updatePermissions'])
            ->middleware('permission:roles.update')
            ->name('roles.permissions.update');

        Route::get('/audit-logs', [AuditLogController::class, 'index'])
            ->middleware('permission:audit.viewAny')
            ->name('audit-logs.index');

        Route::get('/push-notifications', [AdminPushNotificationController::class, 'index'])
            ->middleware('permission:pushNotifications.viewAny')
            ->name('push-notifications.index');

        Route::get('/push-notifications/create', [AdminPushNotificationController::class, 'create'])
            ->middleware('permission:pushNotifications.send')
            ->name('push-notifications.create');

        Route::post('/push-notifications', [AdminPushNotificationController::class, 'store'])
            ->middleware('permission:pushNotifications.send')
            ->name('push-notifications.store');
    });
});

require __DIR__.'/settings.php';
