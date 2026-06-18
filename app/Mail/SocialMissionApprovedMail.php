<?php

namespace App\Mail;

use App\Models\SocialMissionSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SocialMissionApprovedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly SocialMissionSubmission $submission,
        public readonly int $rewardPackCount = 0,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Sua missão foi aprovada no '.config('app.name').'! 🎉',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.social-mission-approved',
            with: [
                'name' => $this->submission->user?->name,
                'missionTitle' => $this->submission->mission?->title,
                'rewardPackCount' => $this->rewardPackCount,
                'platformUrl' => route('dashboard'),
            ],
        );
    }
}
