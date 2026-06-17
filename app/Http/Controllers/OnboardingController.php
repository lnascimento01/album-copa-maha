<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class OnboardingController extends Controller
{
    /**
     * Tours that can be marked as completed by the current user.
     *
     * @var list<string>
     */
    private const TOURS = ['main-menu'];

    /**
     * Mark an onboarding tour as completed for the authenticated user so it
     * does not auto-start again.
     */
    public function complete(Request $request, string $tour): RedirectResponse
    {
        abort_unless(in_array($tour, self::TOURS, true), 404);

        $request->user()->markTourCompleted($tour);

        return back();
    }
}
