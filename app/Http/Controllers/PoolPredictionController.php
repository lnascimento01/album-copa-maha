<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePoolPredictionRequest;
use App\Models\PoolMatch;
use App\Models\PoolPrediction;
use App\Models\User;
use Illuminate\Http\RedirectResponse;

class PoolPredictionController extends Controller
{
    public function store(StorePoolPredictionRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        abort_unless($user->hasPermission('pool.predict'), 403);

        $data = $request->validated();

        $match = PoolMatch::query()->findOrFail($data['match_id']);

        if ($match->isLocked()) {
            return back()->withErrors(['match_id' => 'Este jogo já está bloqueado para palpites.']);
        }

        PoolPrediction::query()->updateOrCreate(
            [
                'user_id' => auth()->id(),
                'match_id' => $data['match_id'],
            ],
            [
                'home_score' => $data['home_score'],
                'away_score' => $data['away_score'],
            ],
        );

        return back()->with('success', 'Palpite salvo com sucesso.');
    }
}
