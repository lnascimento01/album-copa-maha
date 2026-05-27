<?php

namespace App\Policies;

use App\Models\ActivityCheckin;
use App\Models\User;

class ActivityCheckinPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('activityCheckins.viewAny');
    }

    public function view(User $user, ActivityCheckin $activityCheckin): bool
    {
        if ($user->hasPermission('activityCheckins.viewAny')) {
            return true;
        }

        return $user->hasPermission('activityCheckins.viewOwn')
            && $activityCheckin->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('activityCheckins.create');
    }

    public function revoke(User $user, ActivityCheckin $activityCheckin): bool
    {
        return $user->hasPermission('activityCheckins.revoke');
    }
}
