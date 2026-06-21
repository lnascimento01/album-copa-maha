<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSocialMissionSubmissionRequest;
use App\Models\SocialMission;
use App\Models\SocialMissionSubmission;
use App\Models\User;
use App\Services\Audit\AuditLogger;
use App\Services\SocialMissions\Exceptions\SocialMissionException;
use App\Services\SocialMissions\SubmitSocialMissionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SocialMissionSubmissionController extends Controller
{
    public function __construct(
        private readonly SubmitSocialMissionService $submitSocialMissionService,
        private readonly AuditLogger $auditLogger,
    ) {}

    public function index(): Response
    {
        /** @var User $user */
        $user = request()->user();

        abort_unless($user->hasPermission('socialMissionSubmissions.viewOwn'), 403);

        $submissions = SocialMissionSubmission::query()
            ->with(['mission:id,title,slug,type', 'stickerPacks:id,social_mission_submission_id,status'])
            ->where('user_id', $user->id)
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (SocialMissionSubmission $submission): array => [
                'id' => $submission->id,
                'status' => $submission->status,
                'evidence_text' => $submission->evidence_text,
                'evidence_url' => $submission->evidence_url,
                'submitted_at' => optional($submission->submitted_at)?->toDateTimeString(),
                'reviewed_at' => optional($submission->reviewed_at)?->toDateTimeString(),
                'rejection_reason' => $submission->rejection_reason,
                'mission' => $submission->mission,
                'sticker_packs_count' => $submission->stickerPacks->count(),
            ]);

        return Inertia::render('social-submissions/index', [
            'submissions' => $submissions,
        ]);
    }

    public function show(SocialMissionSubmission $submission): Response
    {
        $this->authorize('view', $submission);

        $submission->load([
            'mission:id,title,slug,status,type,reward_pack_quantity,reward_pack_size',
            'reviewer:id,name,email',
            'stickerPacks:id,status,size,source,social_mission_submission_id,created_at',
        ]);

        return Inertia::render('social-submissions/show', [
            'submission' => [
                'id' => $submission->id,
                'status' => $submission->status,
                'evidence_text' => $submission->evidence_text,
                'evidence_url' => $submission->evidence_url,
                'evidence_image_urls' => collect($submission->evidence_images ?? [])->map(fn (string $path) => Storage::disk('public')->url($path))->values()->all(),
                'submitted_at' => optional($submission->submitted_at)?->toDateTimeString(),
                'reviewed_at' => optional($submission->reviewed_at)?->toDateTimeString(),
                'rejection_reason' => $submission->rejection_reason,
                'mission' => $submission->mission,
                'reviewer' => $submission->reviewer,
                'sticker_packs' => $submission->stickerPacks,
            ],
        ]);
    }

    public function store(StoreSocialMissionSubmissionRequest $request, SocialMission $socialMission): RedirectResponse
    {
        /** @var User $user */
        $user = request()->user();

        abort_unless($user->hasPermission('socialMissionSubmissions.createOwn'), 403);

        try {
            $submission = $this->submitSocialMissionService->submit(
                mission: $socialMission,
                actor: $user,
                evidenceText: $request->validated('evidence_text'),
                evidenceUrl: null,
                evidenceImages: $request->file('evidence_images') ?? [],
            );

            return redirect()->route('social-submissions.show', $submission)
                ->with('success', 'Submissão enviada para análise.');
        } catch (SocialMissionException $exception) {
            $this->auditLogger->log(
                action: 'social_mission_submission.denied',
                actor: $user,
                target: $user,
                entityType: SocialMission::class,
                entityId: $socialMission->id,
                metadata: [
                    'social_mission_id' => $socialMission->id,
                    'reason' => $exception->reason,
                ],
            );

            return back()->withErrors([
                'submission' => $exception->getMessage(),
            ]);
        }
    }
}
