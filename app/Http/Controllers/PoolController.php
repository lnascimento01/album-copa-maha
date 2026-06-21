<?php

namespace App\Http\Controllers;

use App\Models\PoolMatch;
use App\Models\PoolSetting;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PoolController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        abort_unless($user->hasPermission('pool.predict'), 403);

        $settings = PoolSetting::current();

        if (! $settings->is_active) {
            return Inertia::render('pool/index', [
                'matchesByDate' => (object) [],
                'dates' => [],
                'settings' => [
                    'exact_score_pack_size' => $settings->exact_score_pack_size,
                    'winner_goals_pack_size' => $settings->winner_goals_pack_size,
                ],
            ]);
        }

        $userId = $request->user()?->id;

        $matches = PoolMatch::query()
            ->with(['predictions' => fn ($query) => $query->where('user_id', $userId)])
            ->where('starts_at', '>=', now()->subDays(1))
            ->orderBy('starts_at')
            ->get();

        $matchesByDate = [];

        foreach ($matches as $match) {
            $dateKey = $match->starts_at->toDateString();
            $prediction = $match->predictions->first();

            $matchesByDate[$dateKey][] = [
                'id' => $match->id,
                'match_number' => $match->match_number,
                'stage' => $match->stage,
                'group_name' => $match->group_name,
                'home_team' => $match->home_team,
                'away_team' => $match->away_team,
                'starts_at' => $match->starts_at->toDateTimeString(),
                'venue' => $match->venue,
                'city' => $match->city,
                'is_locked' => $match->isLocked(),
                'home_score' => $match->home_score,
                'away_score' => $match->away_score,
                'prediction' => $prediction ? [
                    'id' => $prediction->id,
                    'home_score' => $prediction->home_score,
                    'away_score' => $prediction->away_score,
                    'exact_score_rewarded' => $prediction->exact_score_rewarded,
                    'winner_goals_rewarded' => $prediction->winner_goals_rewarded,
                ] : null,
            ];
        }

        $dates = array_keys($matchesByDate);

        return Inertia::render('pool/index', [
            'matchesByDate' => $matchesByDate,
            'dates' => $dates,
            'settings' => [
                'exact_score_pack_size' => $settings->exact_score_pack_size,
                'winner_goals_pack_size' => $settings->winner_goals_pack_size,
            ],
        ]);
    }
}
