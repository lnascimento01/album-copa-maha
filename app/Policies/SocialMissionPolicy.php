<?php

namespace App\Policies;

use App\Models\SocialMission;
use App\Models\User;

class SocialMissionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('socialMissions.viewAny');
    }

    public function view(User $user, SocialMission $socialMission): bool
    {
        return $user->hasPermission('socialMissions.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('socialMissions.create');
    }

    public function update(User $user, SocialMission $socialMission): bool
    {
        return $user->hasPermission('socialMissions.update');
    }

    public function activate(User $user, SocialMission $socialMission): bool
    {
        return $user->hasPermission('socialMissions.activate');
    }

    public function close(User $user, SocialMission $socialMission): bool
    {
        return $user->hasPermission('socialMissions.close');
    }

    public function cancel(User $user, SocialMission $socialMission): bool
    {
        return $user->hasPermission('socialMissions.cancel');
    }
}
