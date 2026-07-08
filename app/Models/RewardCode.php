<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RewardCode extends Model
{
    use HasFactory;

    public const STATUS_DRAFT = 'draft';

    public const STATUS_ACTIVE = 'active';

    public const STATUS_EXPIRED = 'expired';

    public const STATUS_REVOKED = 'revoked';

    public const STATUSES = [
        self::STATUS_DRAFT,
        self::STATUS_ACTIVE,
        self::STATUS_EXPIRED,
        self::STATUS_REVOKED,
    ];

    public const CHANNEL_INSTAGRAM = 'instagram';

    public const CHANNEL_WHATSAPP = 'whatsapp';

    public const CHANNEL_EVENT = 'event';

    public const CHANNEL_MANUAL = 'manual';

    public const CHANNELS = [
        self::CHANNEL_INSTAGRAM,
        self::CHANNEL_WHATSAPP,
        self::CHANNEL_EVENT,
        self::CHANNEL_MANUAL,
    ];

    protected $fillable = [
        'album_id',
        'team_id',
        'activity_id',
        'code',
        'title',
        'description',
        'status',
        'source_channel',
        'reward_pack_quantity',
        'reward_pack_size',
        'starts_at',
        'expires_at',
        'max_total_redemptions',
        'max_redemptions_per_user',
        'redeemed_count',
        'created_by',
        'revoked_by',
        'revoked_at',
        'revoke_reason',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
            'revoked_at' => 'datetime',
            'reward_pack_quantity' => 'integer',
            'reward_pack_size' => 'integer',
            'max_total_redemptions' => 'integer',
            'max_redemptions_per_user' => 'integer',
            'redeemed_count' => 'integer',
            'metadata' => 'array',
        ];
    }

    public function album(): BelongsTo
    {
        return $this->belongsTo(Album::class);
    }

    public function activity(): BelongsTo
    {
        return $this->belongsTo(Activity::class);
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function revokedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'revoked_by');
    }

    public function redemptions(): HasMany
    {
        return $this->hasMany(RewardCodeRedemption::class);
    }

    public function stickerPacks(): HasMany
    {
        return $this->hasMany(StickerPack::class);
    }

    public function allowedUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'reward_code_allowed_users')
            ->withPivot('added_at')
            ->orderBy('name');
    }

    public function hasUserRestriction(): bool
    {
        return $this->allowedUsers()->exists();
    }
}
