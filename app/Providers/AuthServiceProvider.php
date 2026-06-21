<?php

namespace App\Providers;

use App\Models\Achievement;
use App\Models\Activity;
use App\Models\ActivityCheckin;
use App\Models\ActivityCheckinSession;
use App\Models\Album;
use App\Models\AuditLog;
use App\Models\Player;
use App\Models\PushNotification;
use App\Models\RewardCode;
use App\Models\RewardCodeRedemption;
use App\Models\Role;
use App\Models\ShareCard;
use App\Models\SocialMission;
use App\Models\SocialMissionSubmission;
use App\Models\Sticker;
use App\Models\StickerPack;
use App\Models\Team;
use App\Models\User;
use App\Models\UserAchievement;
use App\Models\UserSticker;
use App\Policies\AchievementPolicy;
use App\Policies\ActivityCheckinPolicy;
use App\Policies\ActivityCheckinSessionPolicy;
use App\Policies\ActivityPolicy;
use App\Policies\AlbumPolicy;
use App\Policies\AuditLogPolicy;
use App\Policies\PlayerPolicy;
use App\Policies\PushNotificationPolicy;
use App\Policies\RewardCodePolicy;
use App\Policies\RewardCodeRedemptionPolicy;
use App\Policies\RolePolicy;
use App\Policies\ShareCardPolicy;
use App\Policies\SocialMissionPolicy;
use App\Policies\SocialMissionSubmissionPolicy;
use App\Policies\StickerPackPolicy;
use App\Policies\StickerPolicy;
use App\Policies\TeamPolicy;
use App\Policies\UserAchievementPolicy;
use App\Policies\UserPolicy;
use App\Policies\UserStickerPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        User::class => UserPolicy::class,
        Role::class => RolePolicy::class,
        AuditLog::class => AuditLogPolicy::class,
        Team::class => TeamPolicy::class,
        Album::class => AlbumPolicy::class,
        Player::class => PlayerPolicy::class,
        Sticker::class => StickerPolicy::class,
        UserSticker::class => UserStickerPolicy::class,
        StickerPack::class => StickerPackPolicy::class,
        Activity::class => ActivityPolicy::class,
        ActivityCheckin::class => ActivityCheckinPolicy::class,
        ActivityCheckinSession::class => ActivityCheckinSessionPolicy::class,
        RewardCode::class => RewardCodePolicy::class,
        RewardCodeRedemption::class => RewardCodeRedemptionPolicy::class,
        PushNotification::class => PushNotificationPolicy::class,
        SocialMission::class => SocialMissionPolicy::class,
        SocialMissionSubmission::class => SocialMissionSubmissionPolicy::class,
        Achievement::class => AchievementPolicy::class,
        UserAchievement::class => UserAchievementPolicy::class,
        ShareCard::class => ShareCardPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}
