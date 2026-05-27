<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sticker extends Model
{
    use HasFactory;

    public const TYPE_PLAYER = 'player';

    public const TYPE_GOALKEEPER = 'goalkeeper';

    public const TYPE_STAFF = 'staff';

    public const TYPE_COACH = 'coach';

    public const TYPE_MOMENT = 'moment';

    public const TYPE_SPECIAL = 'special';

    public const TYPE_LEGEND = 'legend';

    public const TYPE_TEAM = 'team';

    public const TYPES = [
        self::TYPE_PLAYER,
        self::TYPE_GOALKEEPER,
        self::TYPE_STAFF,
        self::TYPE_COACH,
        self::TYPE_MOMENT,
        self::TYPE_SPECIAL,
        self::TYPE_LEGEND,
        self::TYPE_TEAM,
    ];

    public const RARITY_COMMON = 'common';

    public const RARITY_RARE = 'rare';

    public const RARITY_EPIC = 'epic';

    public const RARITY_LEGENDARY = 'legendary';

    public const RARITIES = [
        self::RARITY_COMMON,
        self::RARITY_RARE,
        self::RARITY_EPIC,
        self::RARITY_LEGENDARY,
    ];

    protected $fillable = [
        'album_id',
        'player_id',
        'code',
        'title',
        'subtitle',
        'description',
        'type',
        'rarity',
        'image_path',
        'sort_order',
        'is_active',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_active' => 'boolean',
            'metadata' => 'array',
        ];
    }

    public function album(): BelongsTo
    {
        return $this->belongsTo(Album::class);
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class);
    }

    public function userStickers(): HasMany
    {
        return $this->hasMany(UserSticker::class);
    }

    public function packItems(): HasMany
    {
        return $this->hasMany(StickerPackItem::class);
    }
}
