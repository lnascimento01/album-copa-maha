<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class ApprovalScreenController extends Controller
{
    public function pending(Request $request): Response|RedirectResponse
    {
        return $this->screen($request, User::APPROVAL_PENDING, 'approval/pending');
    }

    public function rejected(Request $request): Response|RedirectResponse
    {
        return $this->screen($request, User::APPROVAL_REJECTED, 'approval/rejected');
    }

    public function suspended(Request $request): Response|RedirectResponse
    {
        return $this->screen($request, User::APPROVAL_SUSPENDED, 'approval/suspended');
    }

    /**
     * Render the requested approval screen only when it matches the user's
     * current status. Otherwise redirect to the screen (or dashboard) that
     * actually reflects their status — so an already-approved user can never
     * get stuck on the "pending" page (e.g. a reloaded/backgrounded tab).
     */
    private function screen(Request $request, string $expected, string $component): Response|RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->isApproved()) {
            return redirect()->route('dashboard');
        }

        if ($user->approval_status !== $expected) {
            return match ($user->approval_status) {
                User::APPROVAL_REJECTED => redirect()->route('approval.rejected'),
                User::APPROVAL_SUSPENDED => redirect()->route('approval.suspended'),
                default => redirect()->route('approval.pending'),
            };
        }

        return inertia($component);
    }
}
