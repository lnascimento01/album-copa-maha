<?php

namespace Database\Seeders;

use App\Models\Team;
use Illuminate\Database\Seeder;

class TeamSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Team::query()->updateOrCreate(
            ['slug' => 'maha'],
            [
                'name' => 'MAHA',
                'short_name' => 'MAHA',
                'description' => 'Time oficial do Álbum da Copa MAHA.',
                'is_active' => true,
            ],
        );
    }
}
