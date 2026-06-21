<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PoolPrediction extends Model
{
    protected $fillable = [
        'user_id',
        'match_id',
        'home_score',
        'away_score',
        'exact_score_rewarded',
        'winner_goals_rewarded',
    ];

    protected function casts(): array
    {
        return [
            'home_score' => 'int',
            'away_score' => 'int',
            'exact_score_rewarded' => 'bool',
            'winner_goals_rewarded' => 'bool',
        ];
    }

    public function match(): BelongsTo
    {
        return $this->belongsTo(PoolMatch::class, 'match_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
