<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            ['name' => 'List users', 'slug' => 'users.viewAny', 'group' => 'users'],
            ['name' => 'View user', 'slug' => 'users.view', 'group' => 'users'],
            ['name' => 'Approve user', 'slug' => 'users.approve', 'group' => 'users'],
            ['name' => 'Reject user', 'slug' => 'users.reject', 'group' => 'users'],
            ['name' => 'Update user', 'slug' => 'users.update', 'group' => 'users'],
            ['name' => 'Reset user stickers', 'slug' => 'users.resetStickers', 'group' => 'users'],
            ['name' => 'List roles', 'slug' => 'roles.viewAny', 'group' => 'roles'],
            ['name' => 'View role', 'slug' => 'roles.view', 'group' => 'roles'],
            ['name' => 'Create role', 'slug' => 'roles.create', 'group' => 'roles'],
            ['name' => 'Update role', 'slug' => 'roles.update', 'group' => 'roles'],
            ['name' => 'Delete role', 'slug' => 'roles.delete', 'group' => 'roles'],
            ['name' => 'List audit logs', 'slug' => 'audit.viewAny', 'group' => 'audit'],
            ['name' => 'View audit log', 'slug' => 'audit.view', 'group' => 'audit'],
            ['name' => 'List teams', 'slug' => 'teams.viewAny', 'group' => 'teams'],
            ['name' => 'View team', 'slug' => 'teams.view', 'group' => 'teams'],
            ['name' => 'Create team', 'slug' => 'teams.create', 'group' => 'teams'],
            ['name' => 'Update team', 'slug' => 'teams.update', 'group' => 'teams'],
            ['name' => 'Delete team', 'slug' => 'teams.delete', 'group' => 'teams'],
            ['name' => 'List albums', 'slug' => 'albums.viewAny', 'group' => 'albums'],
            ['name' => 'View album', 'slug' => 'albums.view', 'group' => 'albums'],
            ['name' => 'Create album', 'slug' => 'albums.create', 'group' => 'albums'],
            ['name' => 'Update album', 'slug' => 'albums.update', 'group' => 'albums'],
            ['name' => 'Publish album', 'slug' => 'albums.publish', 'group' => 'albums'],
            ['name' => 'Archive album', 'slug' => 'albums.archive', 'group' => 'albums'],
            ['name' => 'Delete album', 'slug' => 'albums.delete', 'group' => 'albums'],
            ['name' => 'List players', 'slug' => 'players.viewAny', 'group' => 'players'],
            ['name' => 'View player', 'slug' => 'players.view', 'group' => 'players'],
            ['name' => 'Create player', 'slug' => 'players.create', 'group' => 'players'],
            ['name' => 'Update player', 'slug' => 'players.update', 'group' => 'players'],
            ['name' => 'Delete player', 'slug' => 'players.delete', 'group' => 'players'],
            ['name' => 'List stickers', 'slug' => 'stickers.viewAny', 'group' => 'stickers'],
            ['name' => 'View sticker', 'slug' => 'stickers.view', 'group' => 'stickers'],
            ['name' => 'Create sticker', 'slug' => 'stickers.create', 'group' => 'stickers'],
            ['name' => 'Update sticker', 'slug' => 'stickers.update', 'group' => 'stickers'],
            ['name' => 'Delete sticker', 'slug' => 'stickers.delete', 'group' => 'stickers'],
            ['name' => 'List sticker packs', 'slug' => 'stickerPacks.viewAny', 'group' => 'stickerPacks'],
            ['name' => 'View sticker pack', 'slug' => 'stickerPacks.view', 'group' => 'stickerPacks'],
            ['name' => 'Create sticker pack', 'slug' => 'stickerPacks.create', 'group' => 'stickerPacks'],
            ['name' => 'Cancel sticker pack', 'slug' => 'stickerPacks.cancel', 'group' => 'stickerPacks'],
            ['name' => 'View own sticker packs', 'slug' => 'stickerPacks.viewOwn', 'group' => 'stickerPacks'],
            ['name' => 'Open own sticker packs', 'slug' => 'stickerPacks.openOwn', 'group' => 'stickerPacks'],
            ['name' => 'List activities', 'slug' => 'activities.viewAny', 'group' => 'activities'],
            ['name' => 'View activity', 'slug' => 'activities.view', 'group' => 'activities'],
            ['name' => 'Create activity', 'slug' => 'activities.create', 'group' => 'activities'],
            ['name' => 'Update activity', 'slug' => 'activities.update', 'group' => 'activities'],
            ['name' => 'Open activity', 'slug' => 'activities.open', 'group' => 'activities'],
            ['name' => 'Close activity', 'slug' => 'activities.close', 'group' => 'activities'],
            ['name' => 'Cancel activity', 'slug' => 'activities.cancel', 'group' => 'activities'],
            ['name' => 'List activity checkins', 'slug' => 'activityCheckins.viewAny', 'group' => 'activityCheckins'],
            ['name' => 'Create activity checkin', 'slug' => 'activityCheckins.create', 'group' => 'activityCheckins'],
            ['name' => 'Revoke activity checkin', 'slug' => 'activityCheckins.revoke', 'group' => 'activityCheckins'],
            ['name' => 'View own activity checkins', 'slug' => 'activityCheckins.viewOwn', 'group' => 'activityCheckins'],
            ['name' => 'Self confirm activity checkin', 'slug' => 'activityCheckins.selfCreate', 'group' => 'activityCheckins'],
            ['name' => 'List activity checkin sessions', 'slug' => 'activityCheckinSessions.viewAny', 'group' => 'activityCheckinSessions'],
            ['name' => 'Create activity checkin session', 'slug' => 'activityCheckinSessions.create', 'group' => 'activityCheckinSessions'],
            ['name' => 'Revoke activity checkin session', 'slug' => 'activityCheckinSessions.revoke', 'group' => 'activityCheckinSessions'],
            ['name' => 'List reward codes', 'slug' => 'rewardCodes.viewAny', 'group' => 'rewardCodes'],
            ['name' => 'View reward code', 'slug' => 'rewardCodes.view', 'group' => 'rewardCodes'],
            ['name' => 'Create reward code', 'slug' => 'rewardCodes.create', 'group' => 'rewardCodes'],
            ['name' => 'Update reward code', 'slug' => 'rewardCodes.update', 'group' => 'rewardCodes'],
            ['name' => 'Activate reward code', 'slug' => 'rewardCodes.activate', 'group' => 'rewardCodes'],
            ['name' => 'Revoke reward code', 'slug' => 'rewardCodes.revoke', 'group' => 'rewardCodes'],
            ['name' => 'Redeem own reward code', 'slug' => 'rewardCodes.redeemOwn', 'group' => 'rewardCodes'],
            ['name' => 'List reward code redemptions', 'slug' => 'rewardCodeRedemptions.viewAny', 'group' => 'rewardCodeRedemptions'],
            ['name' => 'View own reward code redemptions', 'slug' => 'rewardCodeRedemptions.viewOwn', 'group' => 'rewardCodeRedemptions'],
            ['name' => 'List social missions', 'slug' => 'socialMissions.viewAny', 'group' => 'socialMissions'],
            ['name' => 'View social mission', 'slug' => 'socialMissions.view', 'group' => 'socialMissions'],
            ['name' => 'Create social mission', 'slug' => 'socialMissions.create', 'group' => 'socialMissions'],
            ['name' => 'Update social mission', 'slug' => 'socialMissions.update', 'group' => 'socialMissions'],
            ['name' => 'Activate social mission', 'slug' => 'socialMissions.activate', 'group' => 'socialMissions'],
            ['name' => 'Close social mission', 'slug' => 'socialMissions.close', 'group' => 'socialMissions'],
            ['name' => 'Cancel social mission', 'slug' => 'socialMissions.cancel', 'group' => 'socialMissions'],
            ['name' => 'List social mission submissions', 'slug' => 'socialMissionSubmissions.viewAny', 'group' => 'socialMissionSubmissions'],
            ['name' => 'View own social mission submissions', 'slug' => 'socialMissionSubmissions.viewOwn', 'group' => 'socialMissionSubmissions'],
            ['name' => 'Create own social mission submission', 'slug' => 'socialMissionSubmissions.createOwn', 'group' => 'socialMissionSubmissions'],
            ['name' => 'Approve social mission submission', 'slug' => 'socialMissionSubmissions.approve', 'group' => 'socialMissionSubmissions'],
            ['name' => 'Reject social mission submission', 'slug' => 'socialMissionSubmissions.reject', 'group' => 'socialMissionSubmissions'],
            ['name' => 'List rankings (admin)', 'slug' => 'rankings.viewAny', 'group' => 'rankings'],
            ['name' => 'View own ranking', 'slug' => 'rankings.view', 'group' => 'rankings'],
            ['name' => 'List achievements', 'slug' => 'achievements.viewAny', 'group' => 'achievements'],
            ['name' => 'View achievement', 'slug' => 'achievements.view', 'group' => 'achievements'],
            ['name' => 'View own achievements', 'slug' => 'achievements.viewOwn', 'group' => 'achievements'],
            ['name' => 'Create achievement', 'slug' => 'achievements.create', 'group' => 'achievements'],
            ['name' => 'Update achievement', 'slug' => 'achievements.update', 'group' => 'achievements'],
            ['name' => 'Grant achievement', 'slug' => 'achievements.grant', 'group' => 'achievements'],
            ['name' => 'List share cards', 'slug' => 'shareCards.viewAny', 'group' => 'shareCards'],
            ['name' => 'View own share cards', 'slug' => 'shareCards.viewOwn', 'group' => 'shareCards'],
            ['name' => 'Create own share card', 'slug' => 'shareCards.createOwn', 'group' => 'shareCards'],
            ['name' => 'View own album collection', 'slug' => 'albumCollection.viewOwn', 'group' => 'albumCollection'],
        ];

        foreach ($permissions as $permission) {
            Permission::query()->updateOrCreate(
                ['slug' => $permission['slug']],
                $permission,
            );
        }

        $adminRole = Role::query()->updateOrCreate(
            ['slug' => 'admin'],
            [
                'name' => 'Admin',
                'description' => 'System administrator',
                'is_system' => true,
            ],
        );

        $participantRole = Role::query()->updateOrCreate(
            ['slug' => 'participant'],
            [
                'name' => 'Participant',
                'description' => 'Team participant',
                'is_system' => true,
            ],
        );

        $adminRole->permissions()->sync(Permission::query()->pluck('id')->all());
        $participantRole->permissions()->sync(
            Permission::query()
                ->whereIn('slug', [
                    'albumCollection.viewOwn',
                    'stickerPacks.viewOwn',
                    'stickerPacks.openOwn',
                    'activityCheckins.viewOwn',
                    'activityCheckins.selfCreate',
                    'rewardCodes.redeemOwn',
                    'rewardCodeRedemptions.viewOwn',
                    'socialMissionSubmissions.viewOwn',
                    'socialMissionSubmissions.createOwn',
                    'rankings.view',
                    'achievements.viewOwn',
                    'shareCards.viewOwn',
                    'shareCards.createOwn',
                ])
                ->pluck('id')
                ->all(),
        );
    }
}
