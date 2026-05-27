<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\Audit\AuditLogger;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasPermission
{
    public function __construct(private readonly AuditLogger $auditLogger) {}

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (! $user instanceof User || ! $user->hasPermission($permission)) {
            $this->auditLogger->log(
                action: 'permission.denied',
                actor: $user,
                target: $user,
                metadata: [
                    'permission' => $permission,
                    'route_name' => $request->route()?->getName(),
                    'path' => $request->path(),
                ],
            );

            abort(403);
        }

        return $next($request);
    }
}
