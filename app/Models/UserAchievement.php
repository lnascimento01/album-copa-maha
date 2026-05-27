<?php

namespace App\Models;

use Database\Factories\UserAchievementFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserAchievement extends Model
{
    /** @use HasFactory<UserAchievementFactory> */
    use HasFactory;

    public const SOURCE_EVALUATOR = 'evaluator';

    public const SOURCE_ADMIN = 'admin';

    public const SOURCE_SEED = 'seed';

    public const SOURCES = [
        self::SOURCE_EVALUATOR,
        self::SOURCE_ADMIN,
        self::SOURCE_SEED,
    ];

    protected $fillable = [
        'user_id',
        'achievement_id',
        'album_id',
        'unlocked_at',
        'source',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'unlocked_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function achievement(): BelongsTo
    {
        return $this->belongsTo(Achievement::class);
    }

    public function album(): BelongsTo
    {
        return $this->belongsTo(Album::class);
    }
}
