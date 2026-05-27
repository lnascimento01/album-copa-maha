<?php

declare(strict_types=1);

namespace App\Http\Responses\Auth;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Fortify;

class LoginResponse implements LoginResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     */
    public function toResponse($request)
    {
        if ($request->wantsJson()) {
            return new JsonResponse(['two_factor' => false]);
        }

        /** @var User|null $user */
        $user = $request->user();

        if (! $user instanceof User) {
            return redirect()->intended(Fortify::redirects('login'));
        }

        return redirect()->intended(match ($user->approval_status) {
            User::APPROVAL_PENDING => route('approval.pending', absolute: false),
            User::APPROVAL_REJECTED => route('approval.rejected', absolute: false),
            User::APPROVAL_SUSPENDED => route('approval.suspended', absolute: false),
            default => Fortify::redirects('login'),
        });
    }
}
