<?php

namespace App\Http\Controllers;

use App\Models\SocialMission;
use App\Models\SocialMissionSubmission;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class SocialMissionController extends Controller
{
    public function index(): Response
    {
        /** @var User $user */
        $user = request()->user();

        abort_unless($user->hasPermission('socialMissionSubmissions.createOwn'), 403);

        $missions = SocialMission::query()
            ->where('status', SocialMission::STATUS_ACTIVE)
            ->with(['team:id,name', 'album:id,name'])
            ->orderBy('ends_at')
            ->get();

        $submissions = SocialMissionSubmission::query()
            ->where('user_id', $user->id)
            ->whereIn('social_mission_id', $missions->pluck('id')->all())
            ->orderByDesc('id')
            ->get()
            ->groupBy('social_mission_id');

        return Inertia::render('social-missions/index', [
            'missions' => $missions->map(function (SocialMission $mission) use ($submissions): array {
                $latestSubmission = $submissions->get($mission->id)?->first();

                return [
                    'id' => $mission->id,
                    'title' => $mission->title,
                    'slug' => $mission->slug,
                    'type' => $mission->type,
                    'status' => $mission->status,
                    'instructions' => $mission->instructions,
                    'reward_pack_quantity' => $mission->reward_pack_quantity,
                    'reward_pack_size' => $mission->reward_pack_size,
                    'starts_at' => optional($mission->starts_at)?->toDateTimeString(),
                    'ends_at' => optional($mission->ends_at)?->toDateTimeString(),
                    'team' => $mission->team,
                    'album' => $mission->album,
                    'user_submission_status' => $latestSubmission?->status,
                ];
            })->values()->all(),
        ]);
    }

    public function show(SocialMission $socialMission): Response
    {
        /** @var User $user */
        $user = request()->user();

        abort_unless($user->hasPermission('socialMissionSubmissions.createOwn'), 403);

        $ownSubmissions = SocialMissionSubmission::query()
            ->where('social_mission_id', $socialMission->id)
            ->where('user_id', $user->id)
            ->orderByDesc('id')
            ->get();

        if ($socialMission->status !== SocialMission::STATUS_ACTIVE && $ownSubmissions->isEmpty()) {
            abort(404);
        }

        $socialMission->load(['team:id,name', 'album:id,name']);

        $isActive = $socialMission->status === SocialMission::STATUS_ACTIVE;
        $notStarted = $socialMission->starts_at !== null && now()->lt($socialMission->starts_at);
        $ended = $socialMission->ends_at !== null && now()->gt($socialMission->ends_at);
        $acceptsSubmissions = $isActive && ! $notStarted && ! $ended;

        return Inertia::render('social-missions/show', [
            'mission' => [
                'id' => $socialMission->id,
                'title' => $socialMission->title,
                'slug' => $socialMission->slug,
                'description' => $socialMission->description,
                'instructions' => $socialMission->instructions,
                'type' => $socialMission->type,
                'status' => $socialMission->status,
                'reward_pack_quantity' => $socialMission->reward_pack_quantity,
                'reward_pack_size' => $socialMission->reward_pack_size,
                'starts_at' => optional($socialMission->starts_at)?->toDateTimeString(),
                'ends_at' => optional($socialMission->ends_at)?->toDateTimeString(),
                'team' => $socialMission->team,
                'album' => $socialMission->album,
                'accepts_submissions' => $acceptsSubmissions,
            ],
            'ownSubmissions' => $ownSubmissions->map(fn (SocialMissionSubmission $submission): array => [
                'id' => $submission->id,
                'status' => $submission->status,
                'evidence_text' => $submission->evidence_text,
                'evidence_url' => $submission->evidence_url,
                'submitted_at' => optional($submission->submitted_at)?->toDateTimeString(),
                'reviewed_at' => optional($submission->reviewed_at)?->toDateTimeString(),
                'rejection_reason' => $submission->rejection_reason,
            ])->values()->all(),
        ]);
    }
}
