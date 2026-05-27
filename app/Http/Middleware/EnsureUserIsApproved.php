<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsApproved
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user instanceof User || $user->isApproved()) {
            return $next($request);
        }

        $allowedRoutes = [
            'logout',
            'approval.pending',
            'approval.rejected',
            'approval.suspended',
            'profile.edit',
            'profile.update',
            'security.edit',
            'user-password.update',
            'appearance.edit',
        ];

        if ($request->routeIs($allowedRoutes)) {
            return $next($request);
        }

        return match ($user->approval_status) {
            User::APPROVAL_REJECTED => redirect()->route('approval.rejected'),
            User::APPROVAL_SUSPENDED => redirect()->route('approval.suspended'),
            default => redirect()->route('approval.pending'),
        };
    }
}
