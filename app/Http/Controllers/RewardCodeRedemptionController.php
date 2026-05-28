<?php

namespace App\Http\Controllers;

use App\Http\Requests\RedeemRewardCodeRequest;
use App\Models\Album;
use App\Models\RewardCode;
use App\Models\RewardCodeRedemption;
use App\Models\User;
use App\Services\Achievements\EvaluateUserAchievementsService;
use App\Services\Rewards\Exceptions\RewardCodeRedeemException;
use App\Services\Rewards\RedeemRewardCodeService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RewardCodeRedemptionController extends Controller
{
    public function __construct(
        private readonly RedeemRewardCodeService $redeemRewardCodeService,
        private readonly EvaluateUserAchievementsService $evaluateUserAchievementsService,
    ) {}

    public function index(): Response
    {
        /** @var User $user */
        $user = request()->user();

        $this->authorize('redeemOwn', RewardCode::class);

        $recent = RewardCodeRedemption::query()
            ->with(['rewardCode:id,code,title,source_channel'])
            ->where('user_id', $user->id)
            ->orderByDesc('id')
            ->limit(8)
            ->get()
            ->map(fn (RewardCodeRedemption $redemption): array => [
                'id' => $redemption->id,
                'redeemed_at' => optional($redemption->redeemed_at)?->toDateTimeString(),
                'reward_code' => $redemption->rewardCode,
            ])
            ->values();

        $activeAlbum = Album::query()
            ->where('status', Album::STATUS_ACTIVE)
            ->orderBy('id')
            ->first(['id', 'name']);

        return Inertia::render('reward-codes/redeem', [
            'recentRedemptions' => $recent,
            'activeAlbum' => $activeAlbum,
        ]);
    }

    public function store(RedeemRewardCodeRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = request()->user();

        $this->authorize('redeemOwn', RewardCode::class);

        try {
            $result = $this->redeemRewardCodeService->redeem(
                (string) $request->validated('code'),
                $user,
                $request->integer('album_id') ?: null,
            );

            try {
                $album = $result['redemption']->rewardCode?->album;

                if ($album) {
                    $this->evaluateUserAchievementsService->evaluate($user, $album);
                }
            } catch (\Throwable) {
                // Non-critical side effect: do not interrupt redeem flow.
            }

            return redirect()->route('reward-code.index')->with([
                'success' => 'Código resgatado com sucesso.',
                'redeemResult' => [
                    'redemption_id' => $result['redemption']->id,
                    'pack_ids' => $result['pack_ids'],
                ],
            ]);
        } catch (RewardCodeRedeemException $exception) {
            return back()->withErrors([
                'code' => $this->mapErrorMessage($exception),
            ]);
        }
    }

    public function history(): Response
    {
        /** @var User $user */
        $user = request()->user();

        abort_unless($user->hasPermission('rewardCodeRedemptions.viewOwn'), 403);

        $redemptions = RewardCodeRedemption::query()
            ->with(['rewardCode:id,code,title,source_channel,reward_pack_quantity,reward_pack_size'])
            ->where('user_id', $user->id)
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (RewardCodeRedemption $redemption): array => [
                'id' => $redemption->id,
                'redeemed_at' => optional($redemption->redeemed_at)?->toDateTimeString(),
                'reward_code' => $redemption->rewardCode,
                'pack_count' => $redemption->stickerPacks()->count(),
            ]);

        return Inertia::render('reward-codes/history', [
            'redemptions' => $redemptions,
        ]);
    }

    private function mapErrorMessage(RewardCodeRedeemException $exception): string
    {
        return match ($exception->reason) {
            'not_started' => 'Este código ainda não está disponível.',
            'expired' => 'Este código expirou.',
            'max_per_user_reached' => 'Você já atingiu o limite de resgates deste código.',
            'user_not_approved' => 'Sua conta ainda não está liberada para participar.',
            'wrong_album' => 'Este código não está disponível para o álbum ativo.',
            default => 'Código inválido ou indisponível.',
        };
    }
}
