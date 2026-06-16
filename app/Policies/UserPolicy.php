<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('users.viewAny');
    }

    public function view(User $user, User $target): bool
    {
        if ($user->id === $target->id) {
            return true;
        }

        return $user->hasPermission('users.view');
    }

    public function update(User $user, User $target): bool
    {
        if ($user->id === $target->id) {
            return true;
        }

        return $user->hasPermission('users.update');
    }

    public function approve(User $user, User $target): bool
    {
        return $user->hasPermission('users.approve') && $user->id !== $target->id;
    }

    public function reject(User $user, User $target): bool
    {
        return $user->hasPermission('users.reject') && $user->id !== $target->id;
    }

    public function suspend(User $user, User $target): bool
    {
        return $user->hasPermission('users.update') && $user->id !== $target->id;
    }

    public function resetStickers(User $user, User $target): bool
    {
        return $user->hasPermission('users.resetStickers') && $user->id !== $target->id;
    }
}
