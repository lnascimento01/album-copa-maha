<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;

class ApprovalStatusController extends Controller
{
    public function __invoke(): JsonResponse
    {
        /** @var User $user */
        $user = request()->user();

        return response()->json([
            'approval_status' => $user->approval_status,
            'is_approved' => $user->isApproved(),
            'approved_at' => optional($user->approved_at)?->toDateTimeString(),
            'rejection_reason' => $user->rejection_reason,
        ]);
    }
}
