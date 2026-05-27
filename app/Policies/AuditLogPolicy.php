<?php

namespace App\Policies;

use App\Models\AuditLog;
use App\Models\User;

class AuditLogPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('audit.viewAny');
    }

    public function view(User $user, AuditLog $auditLog): bool
    {
        if ($user->id === $auditLog->actor_user_id || $user->id === $auditLog->target_user_id) {
            return true;
        }

        return $user->hasPermission('audit.view');
    }
}
