<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePushNotificationRequest;
use App\Models\PushNotification;
use App\Models\User;
use App\Services\Push\OneSignalService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PushNotificationController extends Controller
{
    public function __construct(private readonly OneSignalService $push) {}

    public function index(): Response
    {
        $this->authorize('viewAny', PushNotification::class);

        $notifications = PushNotification::query()
            ->with('sender:id,name,email')
            ->orderByDesc('id')
            ->paginate(20);

        return Inertia::render('admin/push-notifications/index', [
            'notifications' => $notifications->through(fn (PushNotification $n): array => [
                'id' => $n->id,
                'title' => $n->title,
                'body' => $n->body,
                'url' => $n->url,
                'target_type' => $n->target_type,
                'recipients_count' => $n->recipients_count,
                'sent_by' => $n->sender,
                'created_at' => $n->created_at?->toDateTimeString(),
            ]),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', PushNotification::class);

        $users = User::query()
            ->where('approval_status', User::APPROVAL_APPROVED)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('admin/push-notifications/create', [
            'users' => $users,
        ]);
    }

    public function store(StorePushNotificationRequest $request): RedirectResponse
    {
        $this->authorize('create', PushNotification::class);

        $data = $request->validated();
        $targetType = $data['target_type'];

        if ($targetType === PushNotification::TARGET_ALL) {
            $recipientIds = User::query()
                ->where('approval_status', User::APPROVAL_APPROVED)
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->all();
        } else {
            $recipientIds = array_map('intval', $data['recipient_ids']);
        }

        $this->push->notifyUsers(
            $recipientIds,
            $data['title'],
            $data['body'],
            $data['url'] ?? null,
        );

        PushNotification::query()->create([
            'title' => $data['title'],
            'body' => $data['body'],
            'url' => $data['url'] ?? null,
            'target_type' => $targetType,
            'recipient_ids' => $targetType === PushNotification::TARGET_SPECIFIC ? $recipientIds : null,
            'recipients_count' => count($recipientIds),
            'sent_by' => $request->user()?->id,
        ]);

        return redirect()->route('admin.push-notifications.index')
            ->with('success', 'Notificação enviada com sucesso.');
    }
}
