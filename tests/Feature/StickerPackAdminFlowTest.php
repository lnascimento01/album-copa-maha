<?php

use App\Mail\StickerPackGrantedMail;
use App\Models\Album;
use App\Models\AuditLog;
use App\Models\Role;
use App\Models\StickerPack;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
    Mail::fake();
});

function makePackAdmin(): User
{
    $admin = User::factory()->create();
    $adminRole = Role::query()->where('slug', 'admin')->firstOrFail();
    $admin->roles()->sync([$adminRole->id]);

    return $admin;
}

function makeApprovedParticipantForPack(): User
{
    $participant = User::factory()->create();
    $participantRole = Role::query()->where('slug', 'participant')->firstOrFail();
    $participant->roles()->sync([$participantRole->id]);

    return $participant;
}

it('admin accesses admin sticker packs', function (): void {
    $admin = makePackAdmin();

    $this->actingAs($admin)->get('/admin/sticker-packs')->assertOk();
});

it('participant cannot access admin sticker packs', function (): void {
    $participant = makeApprovedParticipantForPack();

    $this->actingAs($participant)->get('/admin/sticker-packs')->assertForbidden();
});

it('admin grants one pack to approved user', function (): void {
    $admin = makePackAdmin();
    $participant = makeApprovedParticipantForPack();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();

    $this->actingAs($admin)->post('/admin/sticker-packs', [
        'user_id' => $participant->id,
        'album_id' => $album->id,
        'quantity' => 1,
        'size' => 3,
        'note' => 'Concessão manual',
    ])->assertRedirect('/admin/sticker-packs');

    $this->assertDatabaseHas('sticker_packs', [
        'user_id' => $participant->id,
        'album_id' => $album->id,
        'status' => StickerPack::STATUS_PENDING,
        'size' => 3,
        'granted_by' => $admin->id,
    ]);
});

it('admin grants multiple packs in one action', function (): void {
    $admin = makePackAdmin();
    $participant = makeApprovedParticipantForPack();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();

    $this->actingAs($admin)->post('/admin/sticker-packs', [
        'user_id' => $participant->id,
        'album_id' => $album->id,
        'quantity' => 4,
        'size' => 2,
        'note' => null,
    ])->assertRedirect('/admin/sticker-packs');

    expect(StickerPack::query()->where('user_id', $participant->id)->where('album_id', $album->id)->count())->toBe(4);
});

it('does not allow granting pack to pending user', function (): void {
    $admin = makePackAdmin();
    $pending = User::factory()->pendingApproval()->create();
    $participantRole = Role::query()->where('slug', 'participant')->firstOrFail();
    $pending->roles()->sync([$participantRole->id]);
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();

    $this->actingAs($admin)->post('/admin/sticker-packs', [
        'user_id' => $pending->id,
        'album_id' => $album->id,
        'quantity' => 1,
        'size' => 3,
    ])->assertSessionHasErrors('user_id');
});

it('does not allow invalid size or quantity boundaries', function (): void {
    $admin = makePackAdmin();
    $participant = makeApprovedParticipantForPack();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();

    $this->actingAs($admin)->post('/admin/sticker-packs', [
        'user_id' => $participant->id,
        'album_id' => $album->id,
        'quantity' => 1,
        'size' => 0,
    ])->assertSessionHasErrors('size');

    $this->actingAs($admin)->post('/admin/sticker-packs', [
        'user_id' => $participant->id,
        'album_id' => $album->id,
        'quantity' => 1,
        'size' => 11,
    ])->assertSessionHasErrors('size');

    $this->actingAs($admin)->post('/admin/sticker-packs', [
        'user_id' => $participant->id,
        'album_id' => $album->id,
        'quantity' => 21,
        'size' => 3,
    ])->assertSessionHasErrors('quantity');
});

it('granting packs writes sticker pack granted audit log', function (): void {
    $admin = makePackAdmin();
    $participant = makeApprovedParticipantForPack();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();

    $this->actingAs($admin)->post('/admin/sticker-packs', [
        'user_id' => $participant->id,
        'album_id' => $album->id,
        'quantity' => 2,
        'size' => 3,
    ])->assertRedirect('/admin/sticker-packs');

    $log = AuditLog::query()->where('action', 'sticker_pack.granted')->latest('id')->first();

    expect($log)->not->toBeNull();
    expect($log?->actor_user_id)->toBe($admin->id);
    expect($log?->target_user_id)->toBe($participant->id);
    expect($log?->metadata['quantity'])->toBe(2);

    Mail::assertSent(StickerPackGrantedMail::class, function (StickerPackGrantedMail $mail) use ($participant): bool {
        return $mail->recipient->id === $participant->id
            && $mail->quantity === 2
            && $mail->size === 3;
    });
});

it('admin cancels pending pack and writes audit', function (): void {
    $admin = makePackAdmin();
    $participant = makeApprovedParticipantForPack();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();
    $pack = StickerPack::factory()->create([
        'user_id' => $participant->id,
        'album_id' => $album->id,
        'status' => StickerPack::STATUS_PENDING,
        'granted_by' => $admin->id,
    ]);

    $this->actingAs($admin)->patch("/admin/sticker-packs/{$pack->id}/cancel", [
        'cancellation_reason' => 'Operação cancelada',
    ])->assertRedirect();

    $pack->refresh();

    expect($pack->status)->toBe(StickerPack::STATUS_CANCELLED);
    expect($pack->cancelled_at)->not->toBeNull();

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'sticker_pack.cancelled',
        'entity_id' => $pack->id,
    ]);
});

it('does not allow cancelling opened pack', function (): void {
    $admin = makePackAdmin();
    $participant = makeApprovedParticipantForPack();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();
    $pack = StickerPack::factory()->opened()->create([
        'user_id' => $participant->id,
        'album_id' => $album->id,
    ]);

    $this->actingAs($admin)->patch("/admin/sticker-packs/{$pack->id}/cancel", [
        'cancellation_reason' => 'Tentativa inválida',
    ])->assertSessionHasErrors('pack');
});

it('participant cannot cancel pack', function (): void {
    $participant = makeApprovedParticipantForPack();
    $pack = StickerPack::query()->firstOrFail();

    $this->actingAs($participant)->patch("/admin/sticker-packs/{$pack->id}/cancel", [
        'cancellation_reason' => 'Não deveria',
    ])->assertForbidden();
});
