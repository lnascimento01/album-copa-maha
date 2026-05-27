<?php

namespace App\Models;

use Database\Factories\AchievementFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Achievement extends Model
{
    /** @use HasFactory<AchievementFactory> */
    use HasFactory;

    public const TYPE_ALBUM_PROGRESS = 'album_progress';

    public const TYPE_STICKERS_UNLOCKED = 'stickers_unlocked';

    public const TYPE_PACKS_OPENED = 'packs_opened';

    public const TYPE_CHECKINS_CONFIRMED = 'checkins_confirmed';

    public const TYPE_REWARD_CODES_REDEEMED = 'reward_codes_redeemed';

    public const TYPE_SOCIAL_MISSIONS_APPROVED = 'social_missions_approved';

    public const TYPE_SPECIAL = 'special';

    public const TYPES = [
        self::TYPE_ALBUM_PROGRESS,
        self::TYPE_STICKERS_UNLOCKED,
        self::TYPE_PACKS_OPENED,
        self::TYPE_CHECKINS_CONFIRMED,
        self::TYPE_REWARD_CODES_REDEEMED,
        self::TYPE_SOCIAL_MISSIONS_APPROVED,
        self::TYPE_SPECIAL,
    ];

    protected $fillable = [
        'team_id',
        'album_id',
        'name',
        'slug',
        'description',
        'type',
        'threshold',
        'icon',
        'color',
        'is_active',
        'sort_order',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'threshold' => 'integer',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'metadata' => 'array',
        ];
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function album(): BelongsTo
    {
        return $this->belongsTo(Album::class);
    }

    public function userAchievements(): HasMany
    {
        return $this->hasMany(UserAchievement::class);
    }
}
