<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\RejectUserRequest;
use App\Models\User;
use App\Services\Audit\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserApprovalController extends Controller
{
    public function __construct(private readonly AuditLogger $auditLogger) {}

    public function approve(Request $request, User $user): RedirectResponse
    {
        $this->authorize('approve', $user);

        $actor = $request->user();

        $user->forceFill([
            'approval_status' => User::APPROVAL_APPROVED,
            'approved_at' => now(),
            'approved_by' => $actor?->id,
            'rejected_at' => null,
            'rejected_by' => null,
            'rejection_reason' => null,
        ])->save();

        $this->auditLogger->log(
            action: 'user.approved',
            actor: $actor,
            target: $user,
            metadata: ['new_status' => $user->approval_status],
            entityType: User::class,
            entityId: $user->id,
        );

        return back()->with('success', 'Usuário aprovado com sucesso.');
    }

    public function reject(RejectUserRequest $request, User $user): RedirectResponse
    {
        /** @var User|null $actor */
        $actor = $request->user();

        $user->forceFill([
            'approval_status' => User::APPROVAL_REJECTED,
            'approved_at' => null,
            'approved_by' => null,
            'rejected_at' => now(),
            'rejected_by' => $actor?->id,
            'rejection_reason' => $request->string('rejection_reason')->toString(),
        ])->save();

        $this->auditLogger->log(
            action: 'user.rejected',
            actor: $actor,
            target: $user,
            metadata: [
                'new_status' => $user->approval_status,
                'reason' => $user->rejection_reason,
            ],
            entityType: User::class,
            entityId: $user->id,
        );

        return back()->with('success', 'Usuário rejeitado.');
    }

    public function suspend(Request $request, User $user): RedirectResponse
    {
        $this->authorize('suspend', $user);

        /** @var User|null $actor */
        $actor = $request->user();

        $user->forceFill([
            'approval_status' => User::APPROVAL_SUSPENDED,
        ])->save();

        $this->auditLogger->log(
            action: 'user.suspended',
            actor: $actor,
            target: $user,
            metadata: ['new_status' => $user->approval_status],
            entityType: User::class,
            entityId: $user->id,
        );

        return back()->with('success', 'Usuário suspenso.');
    }
}
