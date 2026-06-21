<?php

namespace App\Policies;

use App\Models\PushNotification;
use App\Models\User;

class PushNotificationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('pushNotifications.viewAny');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('pushNotifications.send');
    }
}
