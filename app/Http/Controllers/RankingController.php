<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\Rankings\BuildAlbumRankingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RankingController extends Controller
{
    public function __construct(private readonly BuildAlbumRankingService $buildAlbumRankingService) {}

    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        abort_unless($user->hasPermission('rankings.view'), 403);

        $result = $this->buildAlbumRankingService->build(includeAdmins: false);
        $rows = $result['rows'];

        $myPosition = $rows->firstWhere('user_id', $user->id);

        return Inertia::render('ranking/index', [
            'album' => $result['album'] ? [
                'id' => $result['album']->id,
                'name' => $result['album']->name,
                'slug' => $result['album']->slug,
                'season' => $result['album']->season,
            ] : null,
            'top' => $rows->values()->all(),
            'me' => $myPosition,
            'formula' => $result['formula'],
        ]);
    }
}
