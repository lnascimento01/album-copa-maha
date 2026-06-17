<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('redireciona usuário já aprovado para o dashboard ao acessar a tela de pendente', function (): void {
    $user = User::factory()->create(); // aprovado por padrão

    $this->actingAs($user)
        ->get('/approval/pending')
        ->assertRedirect('/dashboard');
});

it('mostra a tela de pendente para um usuário realmente pendente', function (): void {
    $user = User::factory()->pendingApproval()->create();

    $this->actingAs($user)
        ->get('/approval/pending')
        ->assertOk();
});

it('redireciona pendente que tenta a tela de rejeitado de volta para pendente', function (): void {
    $user = User::factory()->pendingApproval()->create();

    $this->actingAs($user)
        ->get('/approval/rejected')
        ->assertRedirect(route('approval.pending'));
});

it('redireciona aprovado para o dashboard nas telas de rejeitado e suspenso', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)->get('/approval/rejected')->assertRedirect('/dashboard');
    $this->actingAs($user)->get('/approval/suspended')->assertRedirect('/dashboard');
});
