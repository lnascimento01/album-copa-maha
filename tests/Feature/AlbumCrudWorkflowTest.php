<?php

use App\Models\Album;
use App\Models\Role;
use App\Models\Team;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

function makeAlbumAdmin(): User
{
    $admin = User::factory()->create();
    $role = Role::query()->where('slug', 'admin')->firstOrFail();
    $admin->roles()->sync([$role->id]);

    return $admin;
}

it('admin creates album', function (): void {
    $admin = makeAlbumAdmin();
    $team = Team::factory()->create();

    $this->actingAs($admin)
        ->post('/admin/albums', [
            'team_id' => $team->id,
            'name' => 'Album Teste',
            'slug' => 'album-teste',
            'season' => '2027',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('albums', [
        'team_id' => $team->id,
        'slug' => 'album-teste',
        'status' => Album::STATUS_DRAFT,
    ]);
});

it('admin edits album', function (): void {
    $admin = makeAlbumAdmin();
    $album = Album::factory()->create();

    $this->actingAs($admin)
        ->patch("/admin/albums/{$album->id}", [
            'team_id' => $album->team_id,
            'name' => 'Album Atualizado',
            'slug' => 'album-atualizado',
            'season' => '2028',
        ])
        ->assertRedirect();

    $album->refresh();

    expect($album->name)->toBe('Album Atualizado');
});

it('admin publishes draft album', function (): void {
    $admin = makeAlbumAdmin();
    $team = Team::factory()->create();
    $album = Album::factory()->for($team)->create(['status' => Album::STATUS_DRAFT, 'published_at' => null]);

    $this->actingAs($admin)
        ->patch("/admin/albums/{$album->id}/publish")
        ->assertRedirect();

    $album->refresh();

    expect($album->status)->toBe(Album::STATUS_ACTIVE);
    expect($album->published_at)->not->toBeNull();
});

it('publishing album writes audit log', function (): void {
    $admin = makeAlbumAdmin();
    $team = Team::factory()->create();
    $album = Album::factory()->for($team)->create(['status' => Album::STATUS_DRAFT, 'published_at' => null]);

    $this->actingAs($admin)->patch("/admin/albums/{$album->id}/publish")->assertRedirect();

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'album.published',
        'actor_user_id' => $admin->id,
        'entity_id' => $album->id,
    ]);
});

it('admin archives active album', function (): void {
    $admin = makeAlbumAdmin();
    $album = Album::factory()->active()->create();

    $this->actingAs($admin)->patch("/admin/albums/{$album->id}/archive")->assertRedirect();

    $album->refresh();

    expect($album->status)->toBe(Album::STATUS_ARCHIVED);
});

it('archiving album writes audit log', function (): void {
    $admin = makeAlbumAdmin();
    $album = Album::factory()->active()->create();

    $this->actingAs($admin)->patch("/admin/albums/{$album->id}/archive")->assertRedirect();

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'album.archived',
        'actor_user_id' => $admin->id,
        'entity_id' => $album->id,
    ]);
});

it('participant sees active album', function (): void {
    $participant = User::factory()->create();
    $participantRole = Role::query()->where('slug', 'participant')->firstOrFail();
    $participant->roles()->sync([$participantRole->id]);

    $this->actingAs($participant)->get('/album')->assertOk();
});

it('cannot publish archived album', function (): void {
    $admin = makeAlbumAdmin();
    $album = Album::factory()->archived()->create();

    $this->actingAs($admin)
        ->patch("/admin/albums/{$album->id}/publish")
        ->assertSessionHasErrors('album');

    $this->assertDatabaseMissing('audit_logs', [
        'action' => 'album.published',
        'entity_id' => $album->id,
    ]);
});

it('cannot edit archived album critical fields', function (): void {
    $admin = makeAlbumAdmin();
    $album = Album::factory()->archived()->create();

    $this->actingAs($admin)
        ->patch("/admin/albums/{$album->id}", [
            'team_id' => $album->team_id,
            'name' => 'Nao Deve Mudar',
            'slug' => 'nao-deve-mudar',
        ])
        ->assertForbidden();
});

it('publish blocks when another active album exists for same team', function (): void {
    $admin = makeAlbumAdmin();
    $team = Team::factory()->create();

    Album::factory()->for($team)->active()->create();
    $candidate = Album::factory()->for($team)->create(['status' => Album::STATUS_DRAFT]);

    $this->actingAs($admin)
        ->patch("/admin/albums/{$candidate->id}/publish")
        ->assertSessionHasErrors('album');

    $candidate->refresh();

    expect($candidate->status)->toBe(Album::STATUS_DRAFT);

    $this->assertDatabaseMissing('audit_logs', [
        'action' => 'album.published',
        'entity_id' => $candidate->id,
    ]);
});
