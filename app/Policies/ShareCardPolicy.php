<?php

namespace App\Policies;

use App\Models\ShareCard;
use App\Models\User;

class ShareCardPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('shareCards.viewAny') || $user->hasPermission('shareCards.viewOwn');
    }

    public function view(User $user, ShareCard $shareCard): bool
    {
        if ($user->hasPermission('shareCards.viewAny')) {
            return true;
        }

        return $user->hasPermission('shareCards.viewOwn') && $shareCard->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('shareCards.createOwn');
    }
}
