<?php

namespace Database\Seeders;

use App\Models\Sticker;
use App\Models\User;
use App\Models\UserSticker;
use Illuminate\Database\Seeder;

class UserStickerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $masterEmail = (string) (env('MASTER_EMAIL') ?: env('ADMIN_EMAIL') ?: 'lfsnascimento84@gmail.com');
        $master = User::query()->where('email', $masterEmail)->first();

        if (! $master) {
            return;
        }

        $stickerIds = Sticker::query()->where('is_active', true)->orderBy('id')->limit(3)->pluck('id');

        foreach ($stickerIds as $stickerId) {
            UserSticker::query()
                ->withTrashed()
                ->updateOrCreate(
                    [
                        'user_id' => $master->id,
                        'sticker_id' => $stickerId,
                    ],
                    [
                        'source' => 'seed',
                        'source_id' => null,
                        'unlocked_at' => now(),
                        'created_at' => now(),
                        'deleted_at' => null,
                    ],
                );
        }
    }
}
