<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PoolMatch extends Model
{
    public const STAGE_GROUP = 'group';

    public const STAGE_ROUND_OF_32 = 'round_of_32';

    public const STAGE_ROUND_OF_16 = 'round_of_16';

    public const STAGE_QUARTERFINAL = 'quarterfinal';

    public const STAGE_SEMIFINAL = 'semifinal';

    public const STAGE_THIRD_PLACE = 'third_place';

    public const STAGE_FINAL = 'final';

    protected $fillable = [
        'match_number',
        'stage',
        'group_name',
        'home_team',
        'away_team',
        'starts_at',
        'venue',
        'city',
        'home_score',
        'away_score',
        'penalty_winner',
        'score_set_by',
        'score_locked_at',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'score_locked_at' => 'datetime',
            'home_score' => 'int',
            'away_score' => 'int',
        ];
    }

    public function predictions(): HasMany
    {
        return $this->hasMany(PoolPrediction::class, 'match_id');
    }

    public function scoreSetter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'score_set_by');
    }

    public function isLocked(): bool
    {
        // Comparar via Unix timestamp evita ambiguidade de timezone entre
        // o valor UTC armazenado no DB e o timezone da aplicação (America/Sao_Paulo).
        return $this->starts_at->getTimestamp() <= now()->getTimestamp();
    }

    public function hasScore(): bool
    {
        return $this->score_locked_at !== null;
    }

    public function canSetScore(): bool
    {
        return ! $this->hasScore() && $this->starts_at->getTimestamp() <= now()->subHours(2)->getTimestamp();
    }

    public function isKnockout(): bool
    {
        return $this->stage !== self::STAGE_GROUP;
    }
}
