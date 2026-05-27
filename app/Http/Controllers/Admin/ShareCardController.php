<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Album;
use App\Models\ShareCard;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShareCardController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ShareCard::class);

        $filters = [
            'user_id' => $request->integer('user_id') ?: null,
            'album_id' => $request->integer('album_id') ?: null,
            'type' => $request->string('type')->toString(),
        ];

        $cards = ShareCard::query()
            ->with(['user:id,name,email', 'album:id,name'])
            ->when($filters['user_id'] !== null, fn ($query) => $query->where('user_id', $filters['user_id']))
            ->when($filters['album_id'] !== null, fn ($query) => $query->where('album_id', $filters['album_id']))
            ->when($filters['type'] !== '', fn ($query) => $query->where('type', $filters['type']))
            ->orderByDesc('id')
            ->paginate(30)
            ->withQueryString()
            ->through(fn (ShareCard $card): array => [
                'id' => $card->id,
                'type' => $card->type,
                'title' => $card->title,
                'subtitle' => $card->subtitle,
                'created_at' => optional($card->created_at)?->toDateTimeString(),
                'user' => $card->user,
                'album' => $card->album,
            ]);

        return Inertia::render('admin/share-cards/index', [
            'cards' => $cards,
            'filters' => $filters,
            'types' => ShareCard::TYPES,
            'users' => User::query()->orderBy('name')->get(['id', 'name', 'email']),
            'albums' => Album::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function show(ShareCard $shareCard): Response
    {
        $this->authorize('view', $shareCard);

        $shareCard->load(['user:id,name,email', 'album:id,name,slug']);

        return Inertia::render('admin/share-cards/show', [
            'card' => [
                'id' => $shareCard->id,
                'type' => $shareCard->type,
                'title' => $shareCard->title,
                'subtitle' => $shareCard->subtitle,
                'payload' => $shareCard->payload,
                'created_at' => optional($shareCard->created_at)?->toDateTimeString(),
                'user' => $shareCard->user,
                'album' => $shareCard->album,
            ],
        ]);
    }
}
