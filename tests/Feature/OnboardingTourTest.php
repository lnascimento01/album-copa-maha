<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('marks the main-menu tour as completed for the authenticated user', function (): void {
    $user = User::factory()->create();

    expect($user->hasCompletedTour('main-menu'))->toBeFalse();

    $this->actingAs($user)
        ->post('/onboarding/tour/main-menu/complete')
        ->assertRedirect();

    expect($user->fresh()->hasCompletedTour('main-menu'))->toBeTrue();
});

it('marks the pool-intro tour as completed for the authenticated user', function (): void {
    $user = User::factory()->create();

    expect($user->hasCompletedTour('pool-intro'))->toBeFalse();

    $this->actingAs($user)
        ->post('/onboarding/tour/pool-intro/complete')
        ->assertRedirect();

    expect($user->fresh()->hasCompletedTour('pool-intro'))->toBeTrue();
});

it('rejects unknown tours', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/onboarding/tour/unknown-tour/complete')
        ->assertNotFound();

    expect($user->fresh()->preferences)->toBeNull();
});

it('requires authentication', function (): void {
    $this->post('/onboarding/tour/main-menu/complete')->assertRedirect('/login');
});
