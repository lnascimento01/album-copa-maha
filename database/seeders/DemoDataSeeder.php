<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DemoDataSeeder extends Seeder
{
    /**
     * Seed demonstration data used for local showcase flows.
     */
    public function run(): void
    {
        $this->call([
            ActivitySeeder::class,
            RewardCodeSeeder::class,
            SocialMissionSeeder::class,
            StickerCatalogSeeder::class,
            MahaAthletesSeeder::class,
            AchievementSeeder::class,
            UserStickerSeeder::class,
            StickerPackSeeder::class,
        ]);
    }
}
