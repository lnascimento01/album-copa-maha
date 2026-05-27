<?php

declare(strict_types=1);

use App\Models\Activity;
use App\Models\ActivityCheckinSession;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

function userWithRole(string $roleSlug, string $state = 'approved'): User
{
    $user = match ($state) {
        'pending' => User::factory()->pendingApproval()->create(),
        'rejected' => User::factory()->rejected()->create(),
        'suspended' => User::factory()->suspended()->create(),
        default => User::factory()->create(),
    };

    $role = Role::query()->where('slug', $roleSlug)->firstOrFail();
    $user->roles()->sync([$role->id]);

    return $user;
}

it('participant cannot access admin routes', function (): void {
    $participant = userWithRole('participant');

    foreach (['/admin/users', '/admin/audit-logs', '/admin/activities'] as $route) {
        $this->actingAs($participant)->get($route)->assertForbidden();
    }
});

it('pending user cannot access internal routes', function (): void {
    $pending = userWithRole('participant', 'pending');

    foreach ([
        '/dashboard',
        '/album',
        '/packs',
        '/checkins',
        '/reward-code',
        '/social-missions',
        '/ranking',
        '/achievements',
        '/share-cards',
        '/admin/users',
    ] as $route) {
        $this->actingAs($pending)
            ->get($route)
            ->assertRedirect(route('approval.pending', absolute: false));
    }
});

it('guest is redirected to login for internal routes', function (): void {
    foreach (['/dashboard', '/album', '/packs', '/admin/users'] as $route) {
        $this->get($route)->assertRedirect(route('login'));
    }
});

it('self checkin routes require approved user', function (): void {
    $pending = userWithRole('participant', 'pending');
    $activity = Activity::query()->where('status', Activity::STATUS_OPEN)->firstOrFail();
    $rawToken = 'raw-checkin-token-for-pending-user';

    ActivityCheckinSession::query()->create([
        'activity_id' => $activity->id,
        'token_hash' => hash_hmac('sha256', $rawToken, (string) config('app.key')),
        'public_code' => 'MAHA-PEND1',
        'status' => ActivityCheckinSession::STATUS_ACTIVE,
        'starts_at' => now()->subMinute(),
        'expires_at' => now()->addMinutes(15),
        'max_uses' => 5,
        'used_count' => 0,
        'created_by' => userWithRole('admin')->id,
    ]);

    $this->actingAs($pending)
        ->get("/checkin/{$rawToken}")
        ->assertRedirect(route('approval.pending', absolute: false));
});

it('user without permission receives 403 and denied audit', function (): void {
    $approvedWithoutRole = User::factory()->create();

    $this->actingAs($approvedWithoutRole)
        ->get('/admin/users')
        ->assertForbidden();

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'permission.denied',
        'actor_user_id' => $approvedWithoutRole->id,
    ]);
});

it('admin can access main admin routes', function (): void {
    $admin = userWithRole('admin');

    foreach (['/admin/users', '/admin/audit-logs', '/admin/activities', '/admin/sticker-packs'] as $route) {
        $this->actingAs($admin)->get($route)->assertOk();
    }
});
