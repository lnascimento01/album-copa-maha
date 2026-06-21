<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SocialMission extends Model
{
    use HasFactory;

    public const STATUS_DRAFT = 'draft';

    public const STATUS_ACTIVE = 'active';

    public const STATUS_CLOSED = 'closed';

    public const STATUS_CANCELLED = 'cancelled';

    public const STATUSES = [
        self::STATUS_DRAFT,
        self::STATUS_ACTIVE,
        self::STATUS_CLOSED,
        self::STATUS_CANCELLED,
    ];

    public const TYPE_INSTAGRAM_STORY = 'instagram_story';

    public const TYPE_INSTAGRAM_POST = 'instagram_post';

    public const TYPE_MENTION_TEAM = 'mention_team';

    public const TYPE_SHARE_ALBUM = 'share_album';

    public const TYPE_CUSTOM = 'custom';

    public const TYPES = [
        self::TYPE_INSTAGRAM_STORY,
        self::TYPE_INSTAGRAM_POST,
        self::TYPE_MENTION_TEAM,
        self::TYPE_SHARE_ALBUM,
        self::TYPE_CUSTOM,
    ];

    public const VALIDATION_MANUAL = 'manual';

    public const VALIDATION_MODES = [
        self::VALIDATION_MANUAL,
    ];

    protected $fillable = [
        'team_id',
        'album_id',
        'title',
        'slug',
        'description',
        'instructions',
        'status',
        'type',
        'validation_mode',
        'reward_pack_quantity',
        'reward_pack_size',
        'starts_at',
        'ends_at',
        'max_submissions_total',
        'max_submissions_per_user',
        'approved_count',
        'reminder_sent_at',
        'created_by',
        'updated_by',
        'cancelled_by',
        'cancelled_at',
        'cancellation_reason',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'reminder_sent_at' => 'datetime',
            'reward_pack_quantity' => 'integer',
            'reward_pack_size' => 'integer',
            'max_submissions_total' => 'integer',
            'max_submissions_per_user' => 'integer',
            'approved_count' => 'integer',
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

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function cancelledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(SocialMissionSubmission::class);
    }

    public function stickerPacks(): HasMany
    {
        return $this->hasMany(StickerPack::class);
    }
}
