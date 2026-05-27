<?php

namespace App\Policies;

use App\Models\SocialMissionSubmission;
use App\Models\User;

class SocialMissionSubmissionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('socialMissionSubmissions.viewAny');
    }

    public function view(User $user, SocialMissionSubmission $submission): bool
    {
        if ($user->hasPermission('socialMissionSubmissions.viewAny')) {
            return true;
        }

        return $user->hasPermission('socialMissionSubmissions.viewOwn') && $submission->user_id === $user->id;
    }

    public function createOwn(User $user): bool
    {
        return $user->hasPermission('socialMissionSubmissions.createOwn');
    }

    public function approve(User $user, SocialMissionSubmission $submission): bool
    {
        return $user->hasPermission('socialMissionSubmissions.approve');
    }

    public function reject(User $user, SocialMissionSubmission $submission): bool
    {
        return $user->hasPermission('socialMissionSubmissions.reject');
    }
}
