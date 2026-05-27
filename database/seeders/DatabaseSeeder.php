<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            AdminUserSeeder::class,
            TeamSeeder::class,
            AlbumSeeder::class,
        ]);

        if ((bool) config('app.seed_demo_data', true)) {
            $this->call([
                DemoDataSeeder::class,
            ]);
        }
    }
}
