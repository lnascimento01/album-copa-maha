<?php

namespace App\Policies;

use App\Models\StickerPack;
use App\Models\User;

class StickerPackPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('stickerPacks.viewAny');
    }

    public function view(User $user, StickerPack $stickerPack): bool
    {
        if ($user->hasPermission('stickerPacks.viewAny')) {
            return true;
        }

        return $user->hasPermission('stickerPacks.viewOwn') && $stickerPack->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('stickerPacks.create');
    }

    public function cancel(User $user, StickerPack $stickerPack): bool
    {
        return $user->hasPermission('stickerPacks.cancel');
    }

    public function open(User $user, StickerPack $stickerPack): bool
    {
        return $user->hasPermission('stickerPacks.openOwn') && $stickerPack->user_id === $user->id;
    }
}
