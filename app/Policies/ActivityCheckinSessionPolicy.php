<?php

namespace App\Policies;

use App\Models\ActivityCheckinSession;
use App\Models\User;

class ActivityCheckinSessionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('activityCheckinSessions.viewAny');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('activityCheckinSessions.create');
    }

    public function revoke(User $user, ActivityCheckinSession $activityCheckinSession): bool
    {
        return $user->hasPermission('activityCheckinSessions.revoke');
    }
}
