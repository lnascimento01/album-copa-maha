<?php

use App\Models\Album;
use App\Models\Role;
use App\Models\StickerPack;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(RolePermissionSeeder::class);
});

function signupBonusAdmin(): User
{
    $admin = User::factory()->create();
    $admin->roles()->attach(Role::query()->where('slug', 'admin')->firstOrFail()->id);

    return $admin;
}

it('grants a pending 3-sticker bonus pack on approval', function (): void {
    $admin = signupBonusAdmin();
    $album = Album::factory()->active()->create();
    $pending = User::factory()->pendingApproval()->create();

    $this->actingAs($admin)
        ->patch("/admin/users/{$pending->id}/approve")
        ->assertRedirect();

    $this->assertDatabaseHas('sticker_packs', [
        'user_id' => $pending->id,
        'album_id' => $album->id,
        'source' => StickerPack::SOURCE_BONUS,
        'status' => StickerPack::STATUS_PENDING,
        'size' => 3,
    ]);

    expect(StickerPack::query()->where('user_id', $pending->id)->count())->toBe(1);

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'sticker_pack.granted_signup_bonus',
        'actor_user_id' => $admin->id,
        'target_user_id' => $pending->id,
    ]);
});

it('does not stack bonus packs on re-approval', function (): void {
    $admin = signupBonusAdmin();
    Album::factory()->active()->create();
    $pending = User::factory()->pendingApproval()->create();

    $this->actingAs($admin)->patch("/admin/users/{$pending->id}/approve");
    $this->actingAs($admin)->patch("/admin/users/{$pending->id}/approve");

    expect(
        StickerPack::query()
            ->where('user_id', $pending->id)
            ->where('source', StickerPack::SOURCE_BONUS)
            ->count()
    )->toBe(1);
});

it('approves the user even when no active album exists', function (): void {
    $admin = signupBonusAdmin();
    $pending = User::factory()->pendingApproval()->create();

    $this->actingAs($admin)
        ->patch("/admin/users/{$pending->id}/approve")
        ->assertRedirect();

    $this->assertDatabaseHas('users', [
        'id' => $pending->id,
        'approval_status' => User::APPROVAL_APPROVED,
    ]);

    expect(StickerPack::query()->where('user_id', $pending->id)->count())->toBe(0);
});

it('skips the bonus and audits when active album is ambiguous', function (): void {
    $admin = signupBonusAdmin();
    Album::factory()->active()->create();
    Album::factory()->active()->create();
    $pending = User::factory()->pendingApproval()->create();

    $this->actingAs($admin)->patch("/admin/users/{$pending->id}/approve");

    expect(StickerPack::query()->where('user_id', $pending->id)->count())->toBe(0);

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'sticker_pack.bonus_skipped',
        'target_user_id' => $pending->id,
    ]);
});
