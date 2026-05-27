<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StickerPack extends Model
{
    use HasFactory;

    public const SOURCE_ADMIN = 'admin';

    public const SOURCE_SEED = 'seed';

    public const SOURCE_BONUS = 'bonus';

    public const SOURCE_CHECKIN = 'checkin';

    public const SOURCE_REWARD_CODE = 'reward_code';

    public const SOURCE_SOCIAL_MISSION = 'social_mission';

    public const SOURCE_FUTURE_CHECKIN = 'future_checkin';

    public const SOURCE_FUTURE_MISSION = 'future_mission';

    public const SOURCES = [
        self::SOURCE_ADMIN,
        self::SOURCE_SEED,
        self::SOURCE_BONUS,
        self::SOURCE_CHECKIN,
        self::SOURCE_REWARD_CODE,
        self::SOURCE_SOCIAL_MISSION,
        self::SOURCE_FUTURE_CHECKIN,
        self::SOURCE_FUTURE_MISSION,
    ];

    public const STATUS_PENDING = 'pending';

    public const STATUS_OPENED = 'opened';

    public const STATUS_CANCELLED = 'cancelled';

    public const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_OPENED,
        self::STATUS_CANCELLED,
    ];

    protected $fillable = [
        'user_id',
        'album_id',
        'activity_id',
        'activity_checkin_id',
        'reward_code_id',
        'reward_code_redemption_id',
        'social_mission_id',
        'social_mission_submission_id',
        'granted_by',
        'source',
        'status',
        'size',
        'opened_at',
        'cancelled_at',
        'cancellation_reason',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'size' => 'integer',
            'opened_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'metadata' => 'array',
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

    public function activity(): BelongsTo
    {
        return $this->belongsTo(Activity::class);
    }

    public function activityCheckin(): BelongsTo
    {
        return $this->belongsTo(ActivityCheckin::class, 'activity_checkin_id');
    }

    public function rewardCode(): BelongsTo
    {
        return $this->belongsTo(RewardCode::class);
    }

    public function rewardCodeRedemption(): BelongsTo
    {
        return $this->belongsTo(RewardCodeRedemption::class);
    }

    public function socialMission(): BelongsTo
    {
        return $this->belongsTo(SocialMission::class);
    }

    public function socialMissionSubmission(): BelongsTo
    {
        return $this->belongsTo(SocialMissionSubmission::class);
    }

    public function grantedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'granted_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(StickerPackItem::class);
    }

    public function stickers(): BelongsToMany
    {
        return $this->belongsToMany(Sticker::class, 'sticker_pack_items', 'sticker_pack_id', 'sticker_id')
            ->withPivot(['created_at']);
    }
}
