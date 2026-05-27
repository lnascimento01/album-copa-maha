<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RewardCodeRedemption extends Model
{
    use HasFactory;

    protected $fillable = [
        'reward_code_id',
        'user_id',
        'redeemed_at',
        'ip_address',
        'user_agent',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'redeemed_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function rewardCode(): BelongsTo
    {
        return $this->belongsTo(RewardCode::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function stickerPacks(): HasMany
    {
        return $this->hasMany(StickerPack::class);
    }
}
