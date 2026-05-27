<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $masterName = (string) (env('MASTER_NAME') ?: env('ADMIN_NAME') ?: 'Leandro Nascimento');
        $masterEmail = (string) (env('MASTER_EMAIL') ?: env('ADMIN_EMAIL') ?: 'lfsnascimento84@gmail.com');
        $masterPassword = (string) (env('MASTER_PASSWORD') ?: env('ADMIN_PASSWORD') ?: 'password');

        $masterUser = User::query()->firstOrCreate(
            ['email' => $masterEmail],
            [
                'name' => $masterName,
                'password' => Hash::make($masterPassword),
                'email_verified_at' => now(),
            ],
        );

        $this->ensureAdminAccess($masterUser, $masterName);

        $legacyAdminEmail = env('ADMIN_EMAIL');

        if (is_string($legacyAdminEmail) && $legacyAdminEmail !== '' && $legacyAdminEmail !== $masterEmail) {
            $legacyAdminName = (string) (env('ADMIN_NAME') ?: 'Admin MAHA');
            $legacyAdminPassword = (string) (env('ADMIN_PASSWORD') ?: 'password');

            $legacyAdminUser = User::query()->firstOrCreate(
                ['email' => $legacyAdminEmail],
                [
                    'name' => $legacyAdminName,
                    'password' => Hash::make($legacyAdminPassword),
                    'email_verified_at' => now(),
                ],
            );

            $this->ensureAdminAccess($legacyAdminUser, $legacyAdminName);
        }
    }

    private function ensureAdminAccess(User $user, string $fallbackName): void
    {
        $user->forceFill([
            'name' => $user->name !== '' ? $user->name : $fallbackName,
            'approval_status' => User::APPROVAL_APPROVED,
            'approved_at' => $user->approved_at ?? now(),
            'email_verified_at' => $user->email_verified_at ?? now(),
            'rejected_at' => null,
            'rejected_by' => null,
            'rejection_reason' => null,
        ])->save();

        $adminRole = Role::query()->where('slug', 'admin')->firstOrFail();
        $user->attachRole($adminRole, $user);
    }
}
