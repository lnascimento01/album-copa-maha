<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Rankings\BuildAlbumRankingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RankingController extends Controller
{
    public function __construct(private readonly BuildAlbumRankingService $buildAlbumRankingService) {}

    public function index(Request $request): Response
    {
        abort_unless($request->user()?->hasPermission('rankings.viewAny'), 403);

        $includeAdmins = $request->boolean('include_admins');

        $result = $this->buildAlbumRankingService->build(includeAdmins: $includeAdmins);

        return Inertia::render('admin/rankings/index', [
            'album' => $result['album'] ? [
                'id' => $result['album']->id,
                'name' => $result['album']->name,
                'slug' => $result['album']->slug,
                'season' => $result['album']->season,
            ] : null,
            'rows' => $result['rows']->values()->all(),
            'filters' => [
                'include_admins' => $includeAdmins,
            ],
            'formula' => $result['formula'],
        ]);
    }
}
