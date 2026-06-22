<?php

namespace Database\Seeders;

use App\Models\Album;
use App\Models\StickerPack;
use App\Models\User;
use Illuminate\Database\Seeder;

class StickerPackSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $masterEmail = (string) (env('MASTER_EMAIL') ?: env('ADMIN_EMAIL') ?: 'lfsnascimento84@gmail.com');

        $user = User::query()
            ->where('email', $masterEmail)
            ->where('approval_status', User::APPROVAL_APPROVED)
            ->first();

        $album = Album::query()->where('status', Album::STATUS_ACTIVE)->orderBy('id')->first();

        if (! $user || ! $album) {
            return;
        }

        $alreadySeeded = StickerPack::query()
            ->where('user_id', $user->id)
            ->where('album_id', $album->id)
            ->where('source', StickerPack::SOURCE_SEED)
            ->exists();

        if ($alreadySeeded) {
            return;
        }

        for ($index = 0; $index < 2; $index++) {
            StickerPack::query()->create([
                'user_id' => $user->id,
                'album_id' => $album->id,
                'granted_by' => null,
                'source' => StickerPack::SOURCE_SEED,
                'status' => StickerPack::STATUS_PENDING,
                'size' => 3,
                'metadata' => ['seed_batch' => 'default', 'seed_index' => $index + 1],
            ]);
        }
    }
}
