<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Player extends Model
{
    use HasFactory;

    public const TYPE_PLAYER = 'player';

    public const TYPE_GOALKEEPER = 'goalkeeper';

    public const TYPE_STAFF = 'staff';

    public const TYPE_COACH = 'coach';

    public const TYPE_LEGEND = 'legend';

    public const TYPE_MASCOT = 'mascot';

    public const TYPE_MOMENT_SUBJECT = 'moment_subject';

    public const TYPES = [
        self::TYPE_PLAYER,
        self::TYPE_GOALKEEPER,
        self::TYPE_STAFF,
        self::TYPE_COACH,
        self::TYPE_LEGEND,
        self::TYPE_MASCOT,
        self::TYPE_MOMENT_SUBJECT,
    ];

    protected $fillable = [
        'team_id',
        'name',
        'nickname',
        'shirt_number',
        'position',
        'type',
        'bio',
        'photo_path',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function stickers(): HasMany
    {
        return $this->hasMany(Sticker::class);
    }
}
