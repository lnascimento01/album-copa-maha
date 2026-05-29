<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Activity extends Model
{
    use HasFactory;

    public const TYPE_TRAINING = 'training';

    public const TYPE_MATCH = 'match';

    public const TYPE_EVENT = 'event';

    public const TYPE_SOCIAL = 'social';

    public const TYPE_MANUAL = 'manual';

    public const TYPES = [
        self::TYPE_TRAINING,
        self::TYPE_MATCH,
        self::TYPE_EVENT,
        self::TYPE_SOCIAL,
        self::TYPE_MANUAL,
    ];

    public const STATUS_DRAFT = 'draft';

    public const STATUS_OPEN = 'open';

    public const STATUS_ACTIVE = self::STATUS_OPEN;

    public const STATUS_CLOSED = 'closed';

    public const STATUS_CANCELLED = 'cancelled';

    public const STATUSES = [
        self::STATUS_DRAFT,
        self::STATUS_OPEN,
        self::STATUS_CLOSED,
        self::STATUS_CANCELLED,
    ];

    protected $fillable = [
        'team_id',
        'album_id',
        'title',
        'slug',
        'type',
        'status',
        'description',
        'location_name',
        'latitude',
        'longitude',
        'radius_meters',
        'max_accuracy_meters',
        'event_timezone',
        'event_token',
        'starts_at',
        'ends_at',
        'reward_pack_quantity',
        'reward_pack_size',
        'created_by',
        'updated_by',
        'opened_at',
        'closed_at',
        'cancelled_at',
        'cancellation_reason',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'reward_pack_quantity' => 'integer',
            'reward_pack_size' => 'integer',
            'latitude' => 'float',
            'longitude' => 'float',
            'radius_meters' => 'integer',
            'max_accuracy_meters' => 'integer',
            'opened_at' => 'datetime',
            'closed_at' => 'datetime',
            'cancelled_at' => 'datetime',
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

    public function checkins(): HasMany
    {
        return $this->hasMany(ActivityCheckin::class);
    }

    public function stickerPacks(): HasMany
    {
        return $this->hasMany(StickerPack::class);
    }

    public function checkinSessions(): HasMany
    {
        return $this->hasMany(ActivityCheckinSession::class);
    }

    public function activeCheckinSessions(): HasMany
    {
        return $this->checkinSessions()
            ->where('status', ActivityCheckinSession::STATUS_ACTIVE)
            ->where(function ($query) {
                $query->whereNull('starts_at')
                    ->orWhere('starts_at', '<=', now());
            })
            ->where('expires_at', '>=', now());
    }
}
