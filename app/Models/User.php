<?php

namespace App\Models;

use App\Services\Audit\AuditLogger;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    public const APPROVAL_PENDING = 'pending';

    public const APPROVAL_APPROVED = 'approved';

    public const APPROVAL_REJECTED = 'rejected';

    public const APPROVAL_SUSPENDED = 'suspended';

    protected $fillable = [
        'name',
        'email',
        'password',
        'approval_status',
        'approved_at',
        'approved_by',
        'rejected_at',
        'rejected_by',
        'rejection_reason',
        'last_login_at',
        'last_login_ip',
        'preferences',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
            'last_login_at' => 'datetime',
            'preferences' => 'array',
        ];
    }

    /**
     * Whether the user has already finished the given onboarding tour.
     */
    public function hasCompletedTour(string $tour): bool
    {
        return (bool) data_get($this->preferences, "tours.{$tour}");
    }

    /**
     * Persist that the user finished (or skipped) the given onboarding tour.
     */
    public function markTourCompleted(string $tour): void
    {
        $preferences = $this->preferences ?? [];
        $preferences['tours'][$tour] = now()->toIso8601String();

        $this->preferences = $preferences;
        $this->save();
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_role');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(self::class, 'approved_by');
    }

    public function rejectedBy(): BelongsTo
    {
        return $this->belongsTo(self::class, 'rejected_by');
    }

    public function userStickers(): HasMany
    {
        return $this->hasMany(UserSticker::class);
    }

    public function unlockedStickers(): BelongsToMany
    {
        return $this->belongsToMany(Sticker::class, 'user_stickers')
            ->withPivot(['source', 'source_id', 'unlocked_at', 'created_at']);
    }

    public function stickerPacks(): HasMany
    {
        return $this->hasMany(StickerPack::class);
    }

    public function pendingStickerPacks(): HasMany
    {
        return $this->stickerPacks()->where('status', StickerPack::STATUS_PENDING);
    }

    public function openedStickerPacks(): HasMany
    {
        return $this->stickerPacks()->where('status', StickerPack::STATUS_OPENED);
    }

    public function activityCheckins(): HasMany
    {
        return $this->hasMany(ActivityCheckin::class);
    }

    public function rewardCodeRedemptions(): HasMany
    {
        return $this->hasMany(RewardCodeRedemption::class);
    }

    public function socialMissionSubmissions(): HasMany
    {
        return $this->hasMany(SocialMissionSubmission::class);
    }

    public function checkedActivityCheckins(): HasMany
    {
        return $this->hasMany(ActivityCheckin::class, 'checked_by');
    }

    public function userAchievements(): HasMany
    {
        return $this->hasMany(UserAchievement::class);
    }

    public function achievements(): BelongsToMany
    {
        return $this->belongsToMany(Achievement::class, 'user_achievements')
            ->withPivot(['album_id', 'unlocked_at', 'source', 'metadata', 'created_at', 'updated_at']);
    }

    public function shareCards(): HasMany
    {
        return $this->hasMany(ShareCard::class);
    }

    public function permissions(): Collection
    {
        return Permission::query()
            ->select('permissions.*')
            ->join('role_permission', 'permissions.id', '=', 'role_permission.permission_id')
            ->join('user_role', 'role_permission.role_id', '=', 'user_role.role_id')
            ->where('user_role.user_id', $this->id)
            ->distinct()
            ->get();
    }

    public function hasRole(string $slug): bool
    {
        return $this->roles()->where('slug', $slug)->exists();
    }

    public function hasPermission(string $slug): bool
    {
        return Permission::query()
            ->where('slug', $slug)
            ->whereExists(function ($query) {
                $query->selectRaw('1')
                    ->from('role_permission')
                    ->join('user_role', 'role_permission.role_id', '=', 'user_role.role_id')
                    ->whereColumn('role_permission.permission_id', 'permissions.id')
                    ->where('user_role.user_id', $this->id);
            })
            ->exists();
    }

    public function isApproved(): bool
    {
        return $this->approval_status === self::APPROVAL_APPROVED;
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    public function attachRole(Role $role, ?User $actor = null): void
    {
        if (! $this->roles()->whereKey($role->id)->exists()) {
            $this->roles()->attach($role->id);

            app(AuditLogger::class)->log(
                action: 'user.role_attached',
                actor: $actor,
                target: $this,
                metadata: ['role_slug' => $role->slug],
                entityType: self::class,
                entityId: $this->id,
            );
        }
    }

    public function detachRole(Role $role, ?User $actor = null): void
    {
        if ($this->roles()->whereKey($role->id)->exists()) {
            $this->roles()->detach($role->id);

            app(AuditLogger::class)->log(
                action: 'user.role_detached',
                actor: $actor,
                target: $this,
                metadata: ['role_slug' => $role->slug],
                entityType: self::class,
                entityId: $this->id,
            );
        }
    }
}
