<?php

namespace App\Services\Audit;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Facades\Request;

class AuditLogger
{
    /**
     * @var string[]
     */
    private const SENSITIVE_KEYS = [
        'password',
        'password_confirmation',
        'token',
        'raw_token',
        'remember_token',
        'current_password',
        'new_password',
        'secret',
        'api_key',
        'authorization',
        'cookie',
    ];

    /**
     * @param  array<string, mixed>  $metadata
     */
    public function log(
        string $action,
        ?User $actor = null,
        ?User $target = null,
        array $metadata = [],
        ?string $entityType = null,
        ?int $entityId = null,
    ): void {
        $safeMetadata = $this->sanitizeMetadata($metadata);

        AuditLog::query()->create([
            'actor_user_id' => $actor?->id,
            'target_user_id' => $target?->id,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'metadata' => $safeMetadata === [] ? null : $safeMetadata,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'created_at' => now(),
        ]);
    }

    /**
     * @param  array<string, mixed>  $metadata
     * @return array<string, mixed>
     */
    private function sanitizeMetadata(array $metadata): array
    {
        $sanitized = [];

        foreach ($metadata as $key => $value) {
            if (! is_string($key)) {
                $sanitized[$key] = is_array($value) ? $this->sanitizeMetadata($value) : $value;

                continue;
            }

            $normalizedKey = strtolower($key);

            if (in_array($normalizedKey, self::SENSITIVE_KEYS, true)) {
                $sanitized[$key] = '[REDACTED]';

                continue;
            }

            if (is_array($value)) {
                $sanitized[$key] = $this->sanitizeMetadata($value);

                continue;
            }

            $sanitized[$key] = $value;
        }

        return $sanitized;
    }
}
