<?php

namespace App\Policies;

use App\Models\Album;
use App\Models\User;

class AlbumPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('albums.viewAny');
    }

    public function view(User $user, Album $album): bool
    {
        return $user->hasPermission('albums.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('albums.create');
    }

    public function update(User $user, Album $album): bool
    {
        if ($album->status === Album::STATUS_ARCHIVED) {
            return false;
        }

        return $user->hasPermission('albums.update');
    }

    public function publish(User $user, Album $album): bool
    {
        return $user->hasPermission('albums.publish');
    }

    public function archive(User $user, Album $album): bool
    {
        return $user->hasPermission('albums.archive');
    }

    public function delete(User $user, Album $album): bool
    {
        return $user->hasPermission('albums.delete');
    }
}
