<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UserAchievement;

class UserAchievementPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('achievements.viewAny');
    }

    public function view(User $user, UserAchievement $userAchievement): bool
    {
        if ($user->hasPermission('achievements.viewAny')) {
            return true;
        }

        return $user->hasPermission('achievements.viewOwn') && $userAchievement->user_id === $user->id;
    }
}
