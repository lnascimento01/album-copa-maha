<?php

namespace App\Policies;

use App\Models\Achievement;
use App\Models\User;

class AchievementPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('achievements.viewAny');
    }

    public function view(User $user, Achievement $achievement): bool
    {
        return $user->hasPermission('achievements.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('achievements.create');
    }

    public function update(User $user, Achievement $achievement): bool
    {
        return $user->hasPermission('achievements.update');
    }

    public function grant(User $user, Achievement $achievement): bool
    {
        return $user->hasPermission('achievements.grant');
    }
}
