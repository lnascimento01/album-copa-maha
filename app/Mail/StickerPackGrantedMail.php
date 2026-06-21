<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StickerPackGrantedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly User $recipient,
        public readonly int $quantity,
        public readonly int $size,
        public readonly ?string $note = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Você recebeu pacotes de figurinhas no '.config('app.name').'! 🎁',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.sticker-pack-granted',
            with: [
                'name' => $this->recipient->name,
                'quantity' => $this->quantity,
                'size' => $this->size,
                'note' => $this->note,
                'platformUrl' => route('dashboard'),
            ],
        );
    }
}
