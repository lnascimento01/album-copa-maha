<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RewardCode;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RewardCodeAllowedUserController extends Controller
{
    public function index(Request $request, RewardCode $rewardCode): Response
    {
        $this->authorize('update', $rewardCode);

        $search = $request->string('search')->toString();

        $allowedUsers = $rewardCode->allowedUsers()->get(['users.id', 'users.name', 'users.email']);

        $allowedIds = $allowedUsers->pluck('id');

        $users = User::query()
            ->where('approval_status', User::APPROVAL_APPROVED)
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->whereNotIn('id', $allowedIds)
            ->orderBy('name')
            ->limit(30)
            ->get(['id', 'name', 'email']);

        return Inertia::render('admin/reward-codes/allowed-users', [
            'rewardCode' => [
                'id' => $rewardCode->id,
                'code' => $rewardCode->code,
                'title' => $rewardCode->title,
                'status' => $rewardCode->status,
            ],
            'allowedUsers' => $allowedUsers,
            'users' => $users,
            'search' => $search,
        ]);
    }

    public function store(Request $request, RewardCode $rewardCode): RedirectResponse
    {
        $this->authorize('update', $rewardCode);

        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $rewardCode->allowedUsers()->syncWithoutDetaching([
            $validated['user_id'] => ['added_at' => now()],
        ]);

        return back()->with('success', 'Usuário adicionado.');
    }

    public function destroy(RewardCode $rewardCode, User $user): RedirectResponse
    {
        $this->authorize('update', $rewardCode);

        $rewardCode->allowedUsers()->detach($user->id);

        return back()->with('success', 'Usuário removido.');
    }
}
