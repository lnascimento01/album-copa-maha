<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\Role;
use App\Models\User;
use App\Services\Audit\AuditLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    public function __construct(private readonly AuditLogger $auditLogger) {}

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        return DB::transaction(function () use ($input): User {
            $user = User::query()->create([
                'name' => $input['name'],
                'email' => $input['email'],
                'password' => $input['password'],
                'approval_status' => User::APPROVAL_PENDING,
            ]);

            $participantRole = Role::query()->firstOrCreate(
                ['slug' => 'participant'],
                [
                    'name' => 'Participant',
                    'description' => 'Participant role',
                    'is_system' => true,
                ],
            );

            $user->attachRole($participantRole, $user);

            $this->auditLogger->log(
                action: 'user.registered',
                actor: $user,
                target: $user,
                metadata: ['approval_status' => $user->approval_status],
                entityType: User::class,
                entityId: $user->id,
            );

            return $user;
        });
    }
}
