<?php

namespace App\Models;

use Database\Factories\ShareCardFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShareCard extends Model
{
    /** @use HasFactory<ShareCardFactory> */
    use HasFactory;

    public const UPDATED_AT = null;

    public const TYPE_ALBUM_PROGRESS = 'album_progress';

    public const TYPE_STICKER_UNLOCKED = 'sticker_unlocked';

    public const TYPE_ACHIEVEMENT_UNLOCKED = 'achievement_unlocked';

    public const TYPE_CHECKIN_CONFIRMED = 'checkin_confirmed';

    public const TYPE_PACK_OPENED = 'pack_opened';

    public const TYPE_SOCIAL_MISSION_APPROVED = 'social_mission_approved';

    public const TYPES = [
        self::TYPE_ALBUM_PROGRESS,
        self::TYPE_STICKER_UNLOCKED,
        self::TYPE_ACHIEVEMENT_UNLOCKED,
        self::TYPE_CHECKIN_CONFIRMED,
        self::TYPE_PACK_OPENED,
        self::TYPE_SOCIAL_MISSION_APPROVED,
    ];

    protected $fillable = [
        'user_id',
        'album_id',
        'type',
        'title',
        'subtitle',
        'payload',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function album(): BelongsTo
    {
        return $this->belongsTo(Album::class);
    }
}
