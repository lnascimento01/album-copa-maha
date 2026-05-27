<?php

namespace Database\Factories;

use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Team>
 */
class TeamFactory extends Factory
{
    protected $model = Team::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->company();

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.fake()->unique()->numerify('###'),
            'short_name' => Str::upper(Str::substr(Str::slug($name, ''), 0, 4)),
            'description' => fake()->sentence(),
            'logo_path' => null,
            'primary_color' => null,
            'secondary_color' => null,
            'is_active' => true,
        ];
    }
}
