<?php

namespace Database\Factories;

use App\Models\Album;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Album>
 */
class AlbumFactory extends Factory
{
    protected $model = Album::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = 'Album '.fake()->unique()->numerify('###');

        return [
            'team_id' => Team::factory(),
            'name' => $name,
            'slug' => Str::slug($name).'-'.fake()->unique()->numerify('###'),
            'season' => '2026',
            'description' => fake()->sentence(),
            'cover_image_path' => null,
            'status' => Album::STATUS_DRAFT,
            'starts_at' => null,
            'ends_at' => null,
            'published_at' => null,
            'created_by' => User::factory(),
            'updated_by' => User::factory(),
        ];
    }

    public function active(): static
    {
        return $this->state(fn () => [
            'status' => Album::STATUS_ACTIVE,
            'published_at' => now(),
        ]);
    }

    public function archived(): static
    {
        return $this->state(fn () => [
            'status' => Album::STATUS_ARCHIVED,
        ]);
    }
}
