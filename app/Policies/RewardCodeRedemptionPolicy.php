<?php

namespace App\Policies;

use App\Models\RewardCodeRedemption;
use App\Models\User;

class RewardCodeRedemptionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('rewardCodeRedemptions.viewAny');
    }

    public function view(User $user, RewardCodeRedemption $redemption): bool
    {
        if ($user->hasPermission('rewardCodeRedemptions.viewAny')) {
            return true;
        }

        return $user->hasPermission('rewardCodeRedemptions.viewOwn') && $redemption->user_id === $user->id;
    }
}
