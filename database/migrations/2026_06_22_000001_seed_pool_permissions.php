<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $permissions = [
            ['name' => 'View pool (admin)', 'slug' => 'pool.viewAny', 'group' => 'pool'],
            ['name' => 'Manage pool (admin)', 'slug' => 'pool.manage', 'group' => 'pool'],
            ['name' => 'Make pool predictions', 'slug' => 'pool.predict', 'group' => 'pool'],
        ];

        foreach ($permissions as $data) {
            DB::table('permissions')->updateOrInsert(
                ['slug' => $data['slug']],
                array_merge($data, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ]),
            );
        }

        $participantRoleId = DB::table('roles')->where('slug', 'participant')->value('id');
        $adminRoleId = DB::table('roles')->where('slug', 'admin')->value('id');

        if ($participantRoleId) {
            $predictId = DB::table('permissions')->where('slug', 'pool.predict')->value('id');

            if ($predictId && ! DB::table('role_permission')->where(['role_id' => $participantRoleId, 'permission_id' => $predictId])->exists()) {
                DB::table('role_permission')->insert(['role_id' => $participantRoleId, 'permission_id' => $predictId]);
            }
        }

        if ($adminRoleId) {
            $adminSlugs = ['pool.viewAny', 'pool.manage', 'pool.predict'];
            $adminPermIds = DB::table('permissions')->whereIn('slug', $adminSlugs)->pluck('id');

            foreach ($adminPermIds as $permId) {
                if (! DB::table('role_permission')->where(['role_id' => $adminRoleId, 'permission_id' => $permId])->exists()) {
                    DB::table('role_permission')->insert(['role_id' => $adminRoleId, 'permission_id' => $permId]);
                }
            }
        }
    }

    public function down(): void
    {
        $slugs = ['pool.viewAny', 'pool.manage', 'pool.predict'];
        $ids = DB::table('permissions')->whereIn('slug', $slugs)->pluck('id');

        DB::table('role_permission')->whereIn('permission_id', $ids)->delete();
        DB::table('permissions')->whereIn('slug', $slugs)->delete();
    }
};
