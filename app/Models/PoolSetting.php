<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PoolSetting extends Model
{
    protected $fillable = [
        'is_active',
        'album_id',
        'exact_score_pack_size',
        'winner_goals_pack_size',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'bool',
            'exact_score_pack_size' => 'int',
            'winner_goals_pack_size' => 'int',
        ];
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function album(): BelongsTo
    {
        return $this->belongsTo(Album::class);
    }

    public static function current(): self
    {
        return static::firstOrCreate([], [
            'is_active' => false,
            'exact_score_pack_size' => 5,
            'winner_goals_pack_size' => 3,
        ]);
    }
}
