<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class FixPoolPermissions extends Command
{
    protected $signature = 'pool:fix-permissions';

    protected $description = 'Garante que as permissões do bolão existem e estão atribuídas aos roles corretos';

    public function handle(): int
    {
        $permissions = [
            ['name' => 'View pool (admin)', 'slug' => 'pool.viewAny', 'group' => 'pool'],
            ['name' => 'Manage pool (admin)', 'slug' => 'pool.manage', 'group' => 'pool'],
            ['name' => 'Make pool predictions', 'slug' => 'pool.predict', 'group' => 'pool'],
        ];

        foreach ($permissions as $data) {
            DB::table('permissions')->updateOrInsert(
                ['slug' => $data['slug']],
                array_merge($data, ['created_at' => now(), 'updated_at' => now()]),
            );
        }

        $this->info('Permissões upserted.');

        $participantId = DB::table('roles')->where('slug', 'participant')->value('id');
        $adminId = DB::table('roles')->where('slug', 'admin')->value('id');

        $predictId = DB::table('permissions')->where('slug', 'pool.predict')->value('id');
        $manageId = DB::table('permissions')->where('slug', 'pool.manage')->value('id');
        $viewAnyId = DB::table('permissions')->where('slug', 'pool.viewAny')->value('id');

        if (! $predictId) {
            $this->error('Não foi possível encontrar a permissão pool.predict após upsert.');
            return self::FAILURE;
        }

        $this->line("pool.predict ID: {$predictId}");
        $this->line("participant role ID: " . ($participantId ?? 'NÃO ENCONTRADO'));
        $this->line("admin role ID: " . ($adminId ?? 'NÃO ENCONTRADO'));

        if ($participantId) {
            $this->attachIfMissing($participantId, $predictId, 'participant', 'pool.predict');
        }

        if ($adminId) {
            foreach ([$predictId, $manageId, $viewAnyId] as $permId) {
                if ($permId) {
                    $slug = DB::table('permissions')->where('id', $permId)->value('slug');
                    $this->attachIfMissing($adminId, $permId, 'admin', $slug);
                }
            }
        }

        $this->newLine();
        $this->info('Permissões do bolão verificadas e corrigidas.');

        $this->newLine();
        $this->line('Estado atual do role participant:');
        $rows = DB::table('role_permission as rp')
            ->join('permissions as p', 'p.id', '=', 'rp.permission_id')
            ->where('rp.role_id', $participantId)
            ->where('p.group', 'pool')
            ->select('p.slug')
            ->get();

        foreach ($rows as $row) {
            $this->line("  ✓ {$row->slug}");
        }

        if ($rows->isEmpty()) {
            $this->warn('  Nenhuma permissão pool encontrada para participant.');
        }

        return self::SUCCESS;
    }

    private function attachIfMissing(int $roleId, int $permId, string $roleSlug, string $permSlug): void
    {
        $exists = DB::table('role_permission')
            ->where('role_id', $roleId)
            ->where('permission_id', $permId)
            ->exists();

        if ($exists) {
            $this->line("  [já existe] {$roleSlug} → {$permSlug}");
        } else {
            DB::table('role_permission')->insert(['role_id' => $roleId, 'permission_id' => $permId]);
            $this->info("  [adicionado] {$roleSlug} → {$permSlug}");
        }
    }
}
