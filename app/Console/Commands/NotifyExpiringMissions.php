<?php

namespace App\Console\Commands;

use App\Models\SocialMission;
use App\Models\SocialMissionSubmission;
use App\Models\User;
use App\Services\Push\OneSignalService;
use Illuminate\Console\Command;

class NotifyExpiringMissions extends Command
{
    protected $signature   = 'missions:notify-expiring';
    protected $description = 'Send push notification for missions expiring in ~6h to users who have not submitted';

    public function handle(OneSignalService $push): void
    {
        $missions = SocialMission::query()
            ->where('status', SocialMission::STATUS_ACTIVE)
            ->whereNull('reminder_sent_at')
            ->whereBetween('ends_at', [now()->addHours(5)->addMinutes(30), now()->addHours(6)->addMinutes(30)])
            ->get();

        foreach ($missions as $mission) {
            $submittedUserIds = SocialMissionSubmission::query()
                ->where('social_mission_id', $mission->id)
                ->pluck('user_id')
                ->all();

            $userIds = User::query()
                ->where('approval_status', User::APPROVAL_APPROVED)
                ->when(!empty($submittedUserIds), fn ($q) => $q->whereNotIn('id', $submittedUserIds))
                ->pluck('id')
                ->all();

            if (!empty($userIds)) {
                $push->notifyUsers(
                    $userIds,
                    '⏰ Missão encerrando em breve!',
                    "\"{$mission->title}\" termina em menos de 6 horas. Envie sua participação agora!",
                    url(route('social-missions.show', $mission, false)),
                );
            }

            $mission->forceFill(['reminder_sent_at' => now()])->save();
        }

        $this->info("Processed {$missions->count()} mission(s).");
    }
}
