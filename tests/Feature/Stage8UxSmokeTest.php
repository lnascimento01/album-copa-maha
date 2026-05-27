<?php

use App\Models\Role;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

function makeStage8Admin(): User
{
    $admin = User::factory()->create();
    $admin->roles()->sync([Role::query()->where('slug', 'admin')->firstOrFail()->id]);

    return $admin;
}

function makeStage8Participant(): User
{
    $participant = User::factory()->create();
    $participant->roles()->sync([Role::query()->where('slug', 'participant')->firstOrFail()->id]);

    return $participant;
}

it('keeps participant core routes accessible with key content', function (): void {
    $participant = makeStage8Participant();

    $this->actingAs($participant)->get('/dashboard')->assertOk()->assertInertia(fn (Assert $page) => $page->component('dashboard'));
    $this->actingAs($participant)->get('/album')->assertOk()->assertInertia(fn (Assert $page) => $page->component('album/index'));
    $this->actingAs($participant)->get('/packs')->assertOk()->assertInertia(fn (Assert $page) => $page->component('packs/index'));
    $this->actingAs($participant)->get('/checkins')->assertOk()->assertInertia(fn (Assert $page) => $page->component('checkins/index'));
    $this->actingAs($participant)->get('/reward-code')->assertOk()->assertInertia(fn (Assert $page) => $page->component('reward-codes/redeem'));
    $this->actingAs($participant)->get('/social-missions')->assertOk()->assertInertia(fn (Assert $page) => $page->component('social-missions/index'));
    $this->actingAs($participant)->get('/ranking')->assertOk()->assertInertia(fn (Assert $page) => $page->component('ranking/index'));
    $this->actingAs($participant)->get('/achievements')->assertOk()->assertInertia(fn (Assert $page) => $page->component('achievements/index'));
    $this->actingAs($participant)->get('/share-cards')->assertOk()->assertInertia(fn (Assert $page) => $page->component('share-cards/index'));
});

it('keeps admin operational routes accessible', function (): void {
    $admin = makeStage8Admin();

    $this->actingAs($admin)->get('/admin/users')->assertOk()->assertInertia(fn (Assert $page) => $page->component('admin/users/index'));
    $this->actingAs($admin)->get('/admin/audit-logs')->assertOk()->assertInertia(fn (Assert $page) => $page->component('admin/audit-logs/index'));
    $this->actingAs($admin)->get('/admin/activities')->assertOk()->assertInertia(fn (Assert $page) => $page->component('admin/activities/index'));
    $this->actingAs($admin)->get('/admin/sticker-packs')->assertOk()->assertInertia(fn (Assert $page) => $page->component('admin/sticker-packs/index'));
    $this->actingAs($admin)->get('/admin/reward-codes')->assertOk()->assertInertia(fn (Assert $page) => $page->component('admin/reward-codes/index'));
    $this->actingAs($admin)->get('/admin/social-mission-submissions')->assertOk()->assertInertia(fn (Assert $page) => $page->component('admin/social-mission-submissions/index'));
    $this->actingAs($admin)->get('/admin/rankings')->assertOk()->assertInertia(fn (Assert $page) => $page->component('admin/rankings/index'));
    $this->actingAs($admin)->get('/admin/achievements')->assertOk()->assertInertia(fn (Assert $page) => $page->component('admin/achievements/index'));
});

it('keeps participant blocked from admin routes', function (): void {
    $participant = makeStage8Participant();

    $this->actingAs($participant)->get('/admin/users')->assertForbidden();
    $this->actingAs($participant)->get('/admin/audit-logs')->assertForbidden();
    $this->actingAs($participant)->get('/admin/activities')->assertForbidden();
    $this->actingAs($participant)->get('/admin/sticker-packs')->assertForbidden();
    $this->actingAs($participant)->get('/admin/reward-codes')->assertForbidden();
    $this->actingAs($participant)->get('/admin/social-mission-submissions')->assertForbidden();
    $this->actingAs($participant)->get('/admin/rankings')->assertForbidden();
    $this->actingAs($participant)->get('/admin/achievements')->assertForbidden();
});
