<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PushNotification extends Model
{
    public const TARGET_ALL = 'all_users';
    public const TARGET_SPECIFIC = 'specific_users';

    protected $fillable = [
        'title',
        'body',
        'url',
        'target_type',
        'recipient_ids',
        'recipients_count',
        'sent_by',
    ];

    protected function casts(): array
    {
        return [
            'recipient_ids' => 'array',
            'recipients_count' => 'integer',
        ];
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sent_by');
    }
}
