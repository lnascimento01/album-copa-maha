<?php

namespace App\Services\SocialMissions;

use App\Models\Album;
use App\Models\SocialMission;
use App\Models\SocialMissionSubmission;
use App\Models\User;
use App\Services\Audit\AuditLogger;
use App\Services\SocialMissions\Exceptions\SocialMissionException;

class SubmitSocialMissionService
{
    public function __construct(private readonly AuditLogger $auditLogger) {}

    public function submit(SocialMission $mission, User $actor, ?string $evidenceText, ?string $evidenceUrl): SocialMissionSubmission
    {
        $mission->loadMissing('album');

        if (! $actor->isApproved()) {
            throw new SocialMissionException('Sua conta ainda não está liberada para participar.', 'user_not_approved', [
                'social_mission_id' => $mission->id,
                'user_id' => $actor->id,
            ]);
        }

        if (! $actor->hasPermission('socialMissionSubmissions.createOwn')) {
            throw new SocialMissionException('Não foi possível enviar a submissão.', 'missing_permission', [
                'social_mission_id' => $mission->id,
                'user_id' => $actor->id,
            ]);
        }

        if ($mission->status !== SocialMission::STATUS_ACTIVE) {
            throw new SocialMissionException('Esta missão não aceita novas submissões.', 'mission_not_active', [
                'social_mission_id' => $mission->id,
                'status' => $mission->status,
                'user_id' => $actor->id,
            ]);
        }

        if ($mission->album->status !== Album::STATUS_ACTIVE) {
            throw new SocialMissionException('Esta missão não está disponível no momento.', 'album_not_active', [
                'social_mission_id' => $mission->id,
                'user_id' => $actor->id,
            ]);
        }

        if ($mission->starts_at !== null && now()->lt($mission->starts_at)) {
            throw new SocialMissionException('Esta missão ainda não está disponível.', 'mission_not_started', [
                'social_mission_id' => $mission->id,
                'user_id' => $actor->id,
            ]);
        }

        if ($mission->ends_at !== null && now()->gt($mission->ends_at)) {
            throw new SocialMissionException('Esta missão não aceita novas submissões.', 'mission_ended', [
                'social_mission_id' => $mission->id,
                'user_id' => $actor->id,
            ]);
        }

        $userSubmissionCount = SocialMissionSubmission::query()
            ->where('social_mission_id', $mission->id)
            ->where('user_id', $actor->id)
            ->count();

        if ($userSubmissionCount >= $mission->max_submissions_per_user) {
            throw new SocialMissionException('Você já atingiu o limite de envios para esta missão.', 'max_submissions_per_user', [
                'social_mission_id' => $mission->id,
                'user_id' => $actor->id,
            ]);
        }

        if ($mission->max_submissions_total !== null) {
            $totalSubmissions = SocialMissionSubmission::query()
                ->where('social_mission_id', $mission->id)
                ->count();

            if ($totalSubmissions >= $mission->max_submissions_total) {
                throw new SocialMissionException('Esta missão atingiu o limite de submissões.', 'max_submissions_total', [
                    'social_mission_id' => $mission->id,
                    'user_id' => $actor->id,
                ]);
            }
        }

        $submission = SocialMissionSubmission::query()->create([
            'social_mission_id' => $mission->id,
            'user_id' => $actor->id,
            'status' => SocialMissionSubmission::STATUS_PENDING,
            'evidence_text' => $evidenceText,
            'evidence_url' => $evidenceUrl,
            'submitted_at' => now(),
            'metadata' => [
                'mission_title' => $mission->title,
                'mission_type' => $mission->type,
            ],
        ]);

        $this->auditLogger->log(
            action: 'social_mission_submission.created',
            actor: $actor,
            target: $actor,
            entityType: SocialMissionSubmission::class,
            entityId: $submission->id,
            metadata: [
                'social_mission_id' => $mission->id,
                'submission_id' => $submission->id,
            ],
        );

        return $submission;
    }
}
