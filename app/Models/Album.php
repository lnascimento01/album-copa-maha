<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;

class Album extends Model
{
    use HasFactory;

    public const STATUS_DRAFT = 'draft';

    public const STATUS_ACTIVE = 'active';

    public const STATUS_ARCHIVED = 'archived';

    public const STATUSES = [
        self::STATUS_DRAFT,
        self::STATUS_ACTIVE,
        self::STATUS_ARCHIVED,
    ];

    protected $fillable = [
        'team_id',
        'name',
        'slug',
        'season',
        'description',
        'cover_image_path',
        'status',
        'starts_at',
        'ends_at',
        'published_at',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'published_at' => 'datetime',
        ];
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function teams(): BelongsToMany
    {
        return $this->belongsToMany(Team::class)
            ->withTimestamps();
    }

    public function stickers(): HasMany
    {
        return $this->hasMany(Sticker::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function stickerPacks(): HasMany
    {
        return $this->hasMany(StickerPack::class);
    }

    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class);
    }

    public function rewardCodes(): HasMany
    {
        return $this->hasMany(RewardCode::class);
    }

    public function socialMissions(): HasMany
    {
        return $this->hasMany(SocialMission::class);
    }

    public function achievements(): HasMany
    {
        return $this->hasMany(Achievement::class);
    }

    public function userAchievements(): HasMany
    {
        return $this->hasMany(UserAchievement::class);
    }

    public function shareCards(): HasMany
    {
        return $this->hasMany(ShareCard::class);
    }

    public function teamIds(): Collection
    {
        $teamIds = $this->teams()->pluck('teams.id');

        if ($teamIds->isEmpty() && $this->team_id !== null) {
            $teamIds->push($this->team_id);
        }

        return $teamIds->unique()->values();
    }

    public function collectibleStickersQuery(): Builder
    {
        $teamIds = $this->teamIds();

        return Sticker::query()
            ->where('album_id', $this->id)
            ->where('is_active', true)
            ->where(function (Builder $query) use ($teamIds): void {
                if ($teamIds->isEmpty()) {
                    return;
                }

                $query->whereNull('player_id')
                    ->orWhereHas('player', fn (Builder $playerQuery) => $playerQuery->whereIn('team_id', $teamIds->all()));
            });
    }
}
