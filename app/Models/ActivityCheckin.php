<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ActivityCheckin extends Model
{
    use HasFactory;

    public const STATUS_CONFIRMED = 'confirmed';

    public const STATUS_REVOKED = 'revoked';

    public const STATUSES = [
        self::STATUS_CONFIRMED,
        self::STATUS_REVOKED,
    ];

    protected $fillable = [
        'activity_id',
        'user_id',
        'checked_by',
        'status',
        'checked_at',
        'revoked_at',
        'revoked_by',
        'revoke_reason',
        'notes',
        'latitude',
        'longitude',
        'accuracy_meters',
        'distance_meters',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'checked_at' => 'datetime',
            'revoked_at' => 'datetime',
            'latitude' => 'float',
            'longitude' => 'float',
            'accuracy_meters' => 'integer',
            'distance_meters' => 'integer',
            'metadata' => 'array',
        ];
    }

    public function activity(): BelongsTo
    {
        return $this->belongsTo(Activity::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function checkedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'checked_by');
    }

    public function revokedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'revoked_by');
    }

    public function stickerPacks(): HasMany
    {
        return $this->hasMany(StickerPack::class);
    }
}
