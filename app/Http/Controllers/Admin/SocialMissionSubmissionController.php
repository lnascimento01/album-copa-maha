<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ApproveSocialMissionSubmissionRequest;
use App\Http\Requests\RejectSocialMissionSubmissionRequest;
use App\Mail\SocialMissionApprovedMail;
use App\Models\AuditLog;
use App\Models\SocialMission;
use App\Models\SocialMissionSubmission;
use App\Models\User;
use App\Services\Achievements\EvaluateUserAchievementsService;
use App\Services\Push\OneSignalService;
use App\Services\ShareCards\CreateShareCardService;
use App\Services\SocialMissions\Exceptions\SocialMissionException;
use App\Services\SocialMissions\ReviewSocialMissionSubmissionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class SocialMissionSubmissionController extends Controller
{
    public function __construct(
        private readonly ReviewSocialMissionSubmissionService $reviewService,
        private readonly EvaluateUserAchievementsService $evaluateUserAchievementsService,
        private readonly CreateShareCardService $createShareCardService,
        private readonly OneSignalService $push,
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', SocialMissionSubmission::class);

        $filters = [
            'mission_id' => $request->integer('mission_id') ?: null,
            'user_id' => $request->integer('user_id') ?: null,
            'status' => $request->string('status')->toString(),
            'search' => $request->string('search')->toString(),
        ];

        $submissions = SocialMissionSubmission::query()
            ->with(['mission:id,title,slug', 'user:id,name,email', 'reviewer:id,name,email'])
            ->when($filters['mission_id'] !== null, fn ($query) => $query->where('social_mission_id', $filters['mission_id']))
            ->when($filters['user_id'] !== null, fn ($query) => $query->where('user_id', $filters['user_id']))
            ->when($filters['status'] !== '', fn ($query) => $query->where('status', $filters['status']))
            ->when($filters['search'] !== '', function ($query) use ($filters) {
                $search = $filters['search'];

                $query->where(function ($inner) use ($search) {
                    $inner->where('evidence_text', 'like', "%{$search}%")
                        ->orWhere('evidence_url', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('id')
            ->paginate(30)
            ->withQueryString()
            ->through(fn (SocialMissionSubmission $submission): array => [
                'id' => $submission->id,
                'status' => $submission->status,
                'submitted_at' => optional($submission->submitted_at)?->toDateTimeString(),
                'reviewed_at' => optional($submission->reviewed_at)?->toDateTimeString(),
                'rejection_reason' => $submission->rejection_reason,
                'evidence_text' => $submission->evidence_text,
                'evidence_url' => $submission->evidence_url,
                'mission' => $submission->mission,
                'user' => $submission->user,
                'reviewer' => $submission->reviewer,
            ]);

        return Inertia::render('admin/social-mission-submissions/index', [
            'submissions' => $submissions,
            'filters' => $filters,
            'statuses' => SocialMissionSubmission::STATUSES,
            'missions' => SocialMission::query()->orderBy('title')->get(['id', 'title']),
            'users' => User::query()->orderBy('name')->get(['id', 'name', 'email']),
        ]);
    }

    public function show(Request $request, SocialMissionSubmission $submission): Response
    {
        $this->authorize('view', $submission);

        $submission->load([
            'mission:id,title,slug,status,type,reward_pack_quantity,reward_pack_size',
            'user:id,name,email',
            'reviewer:id,name,email',
            'stickerPacks:id,user_id,source,status,size,social_mission_submission_id,created_at',
        ]);

        $auditLogs = AuditLog::query()
            ->with(['actor:id,name,email', 'target:id,name,email'])
            ->where('entity_type', SocialMissionSubmission::class)
            ->where('entity_id', $submission->id)
            ->orderByDesc('id')
            ->limit(30)
            ->get()
            ->map(fn (AuditLog $log): array => [
                'id' => $log->id,
                'action' => $log->action,
                'metadata' => $log->metadata,
                'created_at' => optional($log->created_at)?->toDateTimeString(),
                'actor' => $log->actor,
                'target' => $log->target,
            ])
            ->values();

        return Inertia::render('admin/social-mission-submissions/show', [
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
                'user' => $submission->user,
                'reviewer' => $submission->reviewer,
                'sticker_packs' => $submission->stickerPacks,
            ],
            'auditLogs' => $auditLogs,
            'can' => [
                'approve' => $request->user()?->can('approve', $submission) ?? false,
                'reject' => $request->user()?->can('reject', $submission) ?? false,
            ],
        ]);
    }

    public function approve(ApproveSocialMissionSubmissionRequest $request, SocialMissionSubmission $submission): RedirectResponse
    {
        $this->authorize('approve', $submission);

        try {
            $result = $this->reviewService->approve($submission->id, $request->user(), $request->validated('note'));

            $submissionModel = $result['submission']->loadMissing(['mission.album', 'user']);

            try {
                if ($submissionModel->mission?->album) {
                    $this->createShareCardService->createForUser(
                        user: $submissionModel->user,
                        type: 'social_mission_approved',
                        album: $submissionModel->mission->album,
                        title: 'Missão social aprovada',
                        subtitle: $submissionModel->mission->title,
                        metric: count($result['pack_ids']),
                        related: [
                            'social_mission_submission_id' => $submissionModel->id,
                            'social_mission_id' => $submissionModel->social_mission_id,
                            'pack_ids' => $result['pack_ids'],
                        ],
                    );

                    $this->evaluateUserAchievementsService->evaluate($submissionModel->user, $submissionModel->mission->album);
                }
            } catch (Throwable) {
                // Non-critical side effect: do not interrupt social mission approval flow.
            }

            // Notify the participant their mission was approved. Best-effort, like
            // the side effects above: a mail failure must never block approval.
            $this->sendApprovalNotification($submissionModel, count($result['pack_ids']));

            if ($submissionModel->user_id !== null) {
                $this->push->notifyUser(
                    $submissionModel->user_id,
                    '🎉 Missão aprovada!',
                    "Sua participação em \"{$submissionModel->mission?->title}\" foi aprovada. Abra seus pacotes!",
                    url(route('social-submissions.show', $submissionModel, false)),
                );
            }

            return back()->with('success', 'Submissão aprovada com sucesso.');
        } catch (SocialMissionException $exception) {
            return back()->withErrors([
                'submission' => $exception->getMessage(),
            ]);
        }
    }

    public function reject(RejectSocialMissionSubmissionRequest $request, SocialMissionSubmission $submission): RedirectResponse
    {
        $this->authorize('reject', $submission);

        try {
            $this->reviewService->reject($submission->id, $request->user(), (string) $request->validated('rejection_reason'));

            $reason = (string) $request->validated('rejection_reason');
            $submission->loadMissing(['mission:id,title', 'user:id']);

            if ($submission->user_id !== null) {
                $this->push->notifyUser(
                    $submission->user_id,
                    'Submissão não aprovada',
                    "Sua participação em \"{$submission->mission?->title}\" não foi aprovada. Motivo: {$reason}",
                    url(route('social-submissions.show', $submission, false)),
                );
            }

            return back()->with('success', 'Submissão rejeitada com sucesso.');
        } catch (SocialMissionException $exception) {
            return back()->withErrors([
                'submission' => $exception->getMessage(),
            ]);
        }
    }

    /**
     * Notify the participant that their social mission submission was approved.
     * Best-effort: failures are reported but never bubble up to block approval.
     */
    private function sendApprovalNotification(SocialMissionSubmission $submission, int $rewardPackCount): void
    {
        $email = $submission->user?->email;

        if (blank($email)) {
            return;
        }

        try {
            Mail::to($email, $submission->user?->name)
                ->send(new SocialMissionApprovedMail($submission, $rewardPackCount));
        } catch (Throwable $exception) {
            report($exception);
        }
    }
}
