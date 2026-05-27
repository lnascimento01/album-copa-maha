<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UserSticker;

class UserStickerPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('albumCollection.viewOwn');
    }

    public function view(User $user, UserSticker $userSticker): bool
    {
        if ($userSticker->user_id === $user->id) {
            return true;
        }

        return $user->hasPermission('stickers.view');
    }
}
