<?php

use App\Mail\UserApprovedMail;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(RolePermissionSeeder::class);
});

function makeApprovingAdmin(): User
{
    $admin = User::factory()->create();
    $adminRole = Role::query()->where('slug', 'admin')->firstOrFail();
    $admin->roles()->attach($adminRole->id);

    return $admin;
}

it('queues the approval email to the user on approval', function (): void {
    Mail::fake();

    $admin = makeApprovingAdmin();
    $pending = User::factory()->pendingApproval()->create();

    $this->actingAs($admin)
        ->patch("/admin/users/{$pending->id}/approve")
        ->assertRedirect();

    Mail::assertQueued(
        UserApprovedMail::class,
        fn (UserApprovedMail $mail): bool => $mail->hasTo($pending->email) && $mail->user->is($pending),
    );
});

it('does not block approval when the approval email fails', function (): void {
    Mail::shouldReceive('to')->andThrow(new RuntimeException('mail transport down'));

    $admin = makeApprovingAdmin();
    $pending = User::factory()->pendingApproval()->create();

    $this->actingAs($admin)
        ->patch("/admin/users/{$pending->id}/approve")
        ->assertRedirect();

    $this->assertDatabaseHas('users', [
        'id' => $pending->id,
        'approval_status' => User::APPROVAL_APPROVED,
    ]);
});
