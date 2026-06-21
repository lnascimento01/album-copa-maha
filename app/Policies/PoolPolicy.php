<?php

namespace App\Policies;

use App\Models\User;

class PoolPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('pool.viewAny');
    }

    public function manage(User $user): bool
    {
        return $user->hasPermission('pool.manage');
    }

    public function predict(User $user): bool
    {
        return $user->hasPermission('pool.predict');
    }
}
