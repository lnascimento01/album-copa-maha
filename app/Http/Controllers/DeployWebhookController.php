<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Process;

class DeployWebhookController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        $secret = env('DEPLOY_SECRET', '');

        if (empty($secret) || $request->header('X-Deploy-Secret') !== $secret) {
            abort(403, 'Forbidden');
        }

        $dir = base_path();
        $remote = env('DEPLOY_GIT_REMOTE', '');
        $log = [];
        $failed = false;

        $steps = [
            "git -C {$dir} pull " . ($remote ?: 'origin') . ' main',
            "composer -d {$dir} install --no-dev --optimize-autoloader --no-interaction",
            "pnpm --dir {$dir} install --frozen-lockfile",
            "pnpm --dir {$dir} run build",
            "php {$dir}/artisan migrate --force",
            "php {$dir}/artisan optimize:clear",
            "php {$dir}/artisan optimize",
        ];

        foreach ($steps as $cmd) {
            $result = Process::timeout(120)->path($dir)->run($cmd);

            $log[] = [
                'cmd' => $cmd,
                'out' => trim($result->output() . $result->errorOutput()),
                'ok'  => $result->successful(),
            ];

            if ($result->failed()) {
                $failed = true;
                break;
            }
        }

        return response()->json([
            'success'    => ! $failed,
            'deployed_at' => now()->toDateTimeString(),
            'log'        => $log,
        ], $failed ? 500 : 200);
    }
}
