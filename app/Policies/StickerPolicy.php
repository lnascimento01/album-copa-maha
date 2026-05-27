<?php

namespace App\Policies;

use App\Models\Sticker;
use App\Models\User;

class StickerPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('stickers.viewAny');
    }

    public function view(User $user, Sticker $sticker): bool
    {
        return $user->hasPermission('stickers.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('stickers.create');
    }

    public function update(User $user, Sticker $sticker): bool
    {
        return $user->hasPermission('stickers.update');
    }

    public function delete(User $user, Sticker $sticker): bool
    {
        return $user->hasPermission('stickers.delete');
    }
}
