<?php

namespace App\Policies;

use App\Models\RewardCode;
use App\Models\User;

class RewardCodePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('rewardCodes.viewAny');
    }

    public function view(User $user, RewardCode $rewardCode): bool
    {
        return $user->hasPermission('rewardCodes.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('rewardCodes.create');
    }

    public function update(User $user, RewardCode $rewardCode): bool
    {
        return $user->hasPermission('rewardCodes.update');
    }

    public function activate(User $user, RewardCode $rewardCode): bool
    {
        return $user->hasPermission('rewardCodes.activate');
    }

    public function revoke(User $user, RewardCode $rewardCode): bool
    {
        return $user->hasPermission('rewardCodes.revoke');
    }

    public function redeemOwn(User $user): bool
    {
        return $user->hasPermission('rewardCodes.redeemOwn');
    }
}
