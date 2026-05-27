<?php

namespace App\Policies;

use App\Models\Player;
use App\Models\User;

class PlayerPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('players.viewAny');
    }

    public function view(User $user, Player $player): bool
    {
        return $user->hasPermission('players.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('players.create');
    }

    public function update(User $user, Player $player): bool
    {
        return $user->hasPermission('players.update');
    }

    public function delete(User $user, Player $player): bool
    {
        return $user->hasPermission('players.delete');
    }
}
