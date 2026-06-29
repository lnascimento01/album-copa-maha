import { Head, router } from '@inertiajs/react';
import { Fragment, useState } from 'react';
import type { FormEvent } from 'react';
import ShareExportPanel from '@/components/share-export-panel';
import { Spinner } from '@/components/ui/spinner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { fmtDateTimeBr } from '@/lib/date';

type PoolMatch = {
    id: number;
    match_number: number;
    stage: string;
    group_name: string | null;
    home_team: string;
    away_team: string;
    starts_at: string;
    city: string | null;
    home_score: number | null;
    away_score: number | null;
    penalty_winner: string | null;
    score_locked_at: string | null;
    predictions_count: number;
    winners_count: number;
    can_set_score: boolean;
};

type Prediction = {
    id: number;
    user_name: string;
    user_email: string | null;
    home_score: number;
    away_score: number;
    exact_score_rewarded: boolean;
    winner_goals_rewarded: boolean;
    created_at: string | null;
    updated_at: string | null;
};

type Settings = {
    is_active: boolean;
    album_id: number | null;
    exact_score_pack_size: number;
    winner_goals_pack_size: number;
};

type Album = {
    id: number;
    name: string;
};

type Props = {
    matches: PoolMatch[];
    settings: Settings;
    albums: Album[];
};

const STAGE_LABELS: Record<string, string> = {
    group: 'Fase de Grupos',
    round_of_32: 'Oitavas (32)',
    round_of_16: 'Oitavas de Final',
    quarterfinal: 'Quartas de Final',
    semifinal: 'Semifinais',
    third_place: 'Terceiro Lugar',
    final: 'Final',
};

function SetScoreModal({
    match,
    onClose,
}: {
    match: PoolMatch;
    onClose: () => void;
}) {
    const [homeScore, setHomeScore] = useState('');
    const [awayScore, setAwayScore] = useState('');
    const [penaltyWinner, setPenaltyWinner] = useState<string | null>(null);

    const isKnockout = match.stage !== 'group';
    const homeVal = parseInt(homeScore, 10);
    const awayVal = parseInt(awayScore, 10);
    const isDraw = homeScore !== '' && awayScore !== '' && !isNaN(homeVal) && !isNaN(awayVal) && homeVal === awayVal;
    const needsPenalty = isKnockout && isDraw;

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (needsPenalty && penaltyWinner === null) return;
        router.post(
            `/admin/pool/matches/${match.id}/score`,
            {
                home_score: homeVal,
                away_score: awayVal,
                ...(needsPenalty && penaltyWinner ? { penalty_winner: penaltyWinner } : {}),
            },
            {
                preserveScroll: true,
                onSuccess: () => onClose(),
            },
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-sm rounded-sm border bg-background p-6 shadow-lg">
                <h2 className="mb-1 text-base font-semibold">Definir Placar</h2>
                <p className="mb-4 text-xs text-muted-foreground">
                    {match.home_team} x {match.away_team}
                </p>
                <div className="mb-4 rounded-sm border border-yellow-300 bg-yellow-50 p-3 text-xs text-yellow-800">
                    Esta ação é irreversível. Os pacotes serão concedidos automaticamente e o próximo jogo será atualizado.
                </div>
                <form onSubmit={submit} className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <label className="mb-1 block text-xs text-muted-foreground">{match.home_team}</label>
                            <input
                                type="number"
                                min={0}
                                max={20}
                                required
                                value={homeScore}
                                onChange={(e) => { setHomeScore(e.target.value); setPenaltyWinner(null); }}
                                className="w-full rounded-sm border px-2 py-2 text-center text-sm"
                            />
                        </div>
                        <span className="pt-5 text-muted-foreground">x</span>
                        <div className="flex-1">
                            <label className="mb-1 block text-xs text-muted-foreground">{match.away_team}</label>
                            <input
                                type="number"
                                min={0}
                                max={20}
                                required
                                value={awayScore}
                                onChange={(e) => { setAwayScore(e.target.value); setPenaltyWinner(null); }}
                                className="w-full rounded-sm border px-2 py-2 text-center text-sm"
                            />
                        </div>
                    </div>

                    {needsPenalty && (
                        <div className="rounded-sm border border-blue-200 bg-blue-50 p-3">
                            <p className="mb-2 text-xs font-medium text-blue-800">Empate — quem avançou nos pênaltis?</p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPenaltyWinner(match.home_team)}
                                    className={`flex-1 rounded-sm border px-2 py-2 text-xs transition-colors ${penaltyWinner === match.home_team ? 'border-blue-500 bg-blue-500 text-white' : 'hover:bg-accent'}`}
                                >
                                    {match.home_team}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPenaltyWinner(match.away_team)}
                                    className={`flex-1 rounded-sm border px-2 py-2 text-xs transition-colors ${penaltyWinner === match.away_team ? 'border-blue-500 bg-blue-500 text-white' : 'hover:bg-accent'}`}
                                >
                                    {match.away_team}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="cursor-pointer rounded-sm border px-3 py-2 text-xs hover:bg-accent">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={needsPenalty && penaltyWinner === null}
                            className="cursor-pointer rounded-sm border bg-primary px-3 py-2 text-xs text-primary-foreground transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Confirmar Placar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function PoolShareButton() {
    const payload = {
        type: 'pool_active',
        title: 'Bolão Copa 2026 está no ar!',
        subtitle: 'Faça seus palpites, acerte o placar e ganhe figurinhas.',
        album_name: 'Álbum da Copa MAHA 2026',
        date: new Date().toISOString(),
    };
    const shareCopy = '⚽ O Bolão da Copa 2026 está no ar! Faça seus palpites pelo app, acerte o placar e ganhe figurinhas para o seu álbum. #CopaAAPH #BolãoMaHa';

    return (
        <Dialog>
            <DialogTrigger className="cursor-pointer rounded-sm border px-3 py-2 text-xs transition-colors hover:bg-accent">
                Compartilhar Bolão
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Compartilhar bolão</DialogTitle>
                    <DialogDescription>Gere uma imagem pronta para divulgar que o bolão está no ar.</DialogDescription>
                </DialogHeader>
                <ShareExportPanel payload={payload} shareCopy={shareCopy} fileBase="bolao-copa-2026" />
            </DialogContent>
        </Dialog>
    );
}

export default function AdminPoolIndex({ matches, settings, albums }: Props) {
    const [isActive, setIsActive] = useState(settings.is_active);
    const [albumId, setAlbumId] = useState(settings.album_id ? String(settings.album_id) : '');
    const [exactSize, setExactSize] = useState(String(settings.exact_score_pack_size));
    const [winnerSize, setWinnerSize] = useState(String(settings.winner_goals_pack_size));
    const [scoreModal, setScoreModal] = useState<PoolMatch | null>(null);
    const [expanded, setExpanded] = useState<Set<number>>(new Set());
    const [predictions, setPredictions] = useState<Record<number, Prediction[] | 'loading' | 'error'>>({});

    const loadPredictions = (matchId: number) => {
        setPredictions((prev) => ({ ...prev, [matchId]: 'loading' }));
        fetch(`/admin/pool/matches/${matchId}/predictions`, {
            headers: { Accept: 'application/json' },
            credentials: 'same-origin',
        })
            .then((response) => {
                if (!response.ok) throw new Error('request failed');
                return response.json();
            })
            .then((data: { predictions: Prediction[] }) => {
                setPredictions((prev) => ({ ...prev, [matchId]: data.predictions }));
            })
            .catch(() => {
                setPredictions((prev) => ({ ...prev, [matchId]: 'error' }));
            });
    };

    const togglePredictions = (matchId: number) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(matchId)) {
                next.delete(matchId);
            } else {
                next.add(matchId);
            }
            return next;
        });

        if (predictions[matchId] === undefined) {
            loadPredictions(matchId);
        }
    };

    const saveSettings = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.post(
            '/admin/pool/settings',
            {
                is_active: isActive,
                album_id: albumId || null,
                exact_score_pack_size: parseInt(exactSize, 10),
                winner_goals_pack_size: parseInt(winnerSize, 10),
            },
            { preserveScroll: true },
        );
    };

    const groupedByStage = matches.reduce<Record<string, PoolMatch[]>>((acc, match) => {
        if (!acc[match.stage]) acc[match.stage] = [];
        acc[match.stage].push(match);
        return acc;
    }, {});

    const stageOrder = ['group', 'round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final'];

    return (
        <>
            <Head title="Bolao (Admin)" />
            <div className="space-y-6 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h1 className="text-xl font-semibold tracking-tight">Bolao Copa 2026</h1>
                    <PoolShareButton />
                </div>

                <form onSubmit={saveSettings} className="rounded-sm border p-4">
                    <div className="mb-3 text-sm font-medium">Configuracoes</div>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div>
                            <label className="mb-1 block text-xs uppercase text-muted-foreground">Status</label>
                            <select
                                value={isActive ? '1' : '0'}
                                onChange={(event) => setIsActive(event.target.value === '1')}
                                className="w-full rounded-sm border px-2 py-2 text-sm"
                            >
                                <option value="0">Inativo</option>
                                <option value="1">Ativo</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs uppercase text-muted-foreground">Album de recompensa</label>
                            <select
                                value={albumId}
                                onChange={(event) => setAlbumId(event.target.value)}
                                className="w-full rounded-sm border px-2 py-2 text-sm"
                            >
                                <option value="">Nenhum</option>
                                {albums.map((album) => (
                                    <option key={album.id} value={album.id}>{album.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs uppercase text-muted-foreground">Figurinhas (acerto exato)</label>
                            <input
                                type="number"
                                min={1}
                                max={50}
                                value={exactSize}
                                onChange={(event) => setExactSize(event.target.value)}
                                className="w-full rounded-sm border px-2 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs uppercase text-muted-foreground">Figurinhas (gols vencedor)</label>
                            <input
                                type="number"
                                min={1}
                                max={50}
                                value={winnerSize}
                                onChange={(event) => setWinnerSize(event.target.value)}
                                className="w-full rounded-sm border px-2 py-2 text-sm"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button type="submit" className="cursor-pointer rounded-sm border bg-primary px-3 py-2 text-xs text-primary-foreground transition-all hover:brightness-110">
                            Salvar Configuracoes
                        </button>
                    </div>
                </form>

                {stageOrder.map((stage) => {
                    const stageMatches = groupedByStage[stage];
                    if (!stageMatches || stageMatches.length === 0) return null;

                    return (
                        <div key={stage} className="space-y-2">
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                {STAGE_LABELS[stage] ?? stage}
                            </h2>
                            <div className="overflow-x-auto rounded-sm border">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="px-4 py-2">#</th>
                                            <th className="px-4 py-2">Jogo</th>
                                            <th className="px-4 py-2">Data</th>
                                            <th className="px-4 py-2">Cidade</th>
                                            <th className="px-4 py-2">Palpites</th>
                                            <th className="px-4 py-2">Placar</th>
                                            <th className="px-4 py-2">Acao</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stageMatches.map((match) => {
                                            const isOpen = expanded.has(match.id);
                                            const rows = predictions[match.id];

                                            return (
                                                <Fragment key={match.id}>
                                                    <tr className={isOpen ? 'border-b bg-muted/40' : 'border-b'}>
                                                        <td className="px-4 py-2 text-muted-foreground">{match.match_number}</td>
                                                        <td className="px-4 py-2 font-medium">
                                                            {match.home_team} x {match.away_team}
                                                            {match.group_name && (
                                                                <span className="ml-2 text-xs text-muted-foreground">Gr. {match.group_name}</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2 text-xs">{fmtDateTimeBr(match.starts_at)}</td>
                                                        <td className="px-4 py-2 text-xs">{match.city ?? '-'}</td>
                                                        <td className="px-4 py-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => togglePredictions(match.id)}
                                                                disabled={match.predictions_count === 0}
                                                                aria-expanded={isOpen}
                                                                className="inline-flex items-center gap-1 rounded-sm px-1.5 py-1 text-xs transition-colors hover:bg-accent disabled:cursor-default disabled:opacity-50 disabled:hover:bg-transparent"
                                                            >
                                                                <span
                                                                    className={`transition-transform ${isOpen ? 'rotate-90' : ''} ${match.predictions_count === 0 ? 'invisible' : ''}`}
                                                                    aria-hidden
                                                                >
                                                                    ›
                                                                </span>
                                                                <span className="font-medium">{match.predictions_count}</span>
                                                                <span className="text-muted-foreground">{match.predictions_count === 1 ? 'palpite' : 'palpites'}</span>
                                                            </button>
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            {match.home_score !== null ? (
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <span className="font-semibold">{match.home_score} x {match.away_score}</span>
                                                                    {match.penalty_winner && (
                                                                        <span className="inline-flex items-center gap-1 rounded-sm bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-800">
                                                                            🥅 {match.penalty_winner} (pen.)
                                                                        </span>
                                                                    )}
                                                                    {match.winners_count > 0 && (
                                                                        <span
                                                                            className="inline-flex items-center gap-1 rounded-sm bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-800"
                                                                            title={`${match.winners_count} ${match.winners_count === 1 ? 'palpite premiado' : 'palpites premiados'} neste jogo`}
                                                                        >
                                                                            🏆 {match.winners_count} {match.winners_count === 1 ? 'vencedor' : 'vencedores'}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted-foreground">-</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            {match.can_set_score && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setScoreModal(match)}
                                                                    className="cursor-pointer rounded-sm border px-2 py-1 text-xs hover:bg-accent"
                                                                >
                                                                    Definir Placar
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    {isOpen && (
                                                        <tr className="border-b bg-muted/20">
                                                            <td colSpan={7} className="px-4 py-3">
                                                                {rows === 'loading' && (
                                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                        <Spinner className="size-4" /> Carregando palpites...
                                                                    </div>
                                                                )}
                                                                {rows === 'error' && (
                                                                    <div className="flex items-center justify-between gap-2 text-xs text-destructive">
                                                                        <span>Nao foi possivel carregar os palpites.</span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => loadPredictions(match.id)}
                                                                            className="cursor-pointer rounded-sm border px-2 py-1 hover:bg-accent"
                                                                        >
                                                                            Tentar novamente
                                                                        </button>
                                                                    </div>
                                                                )}
                                                                {Array.isArray(rows) && rows.length === 0 && (
                                                                    <p className="text-xs text-muted-foreground">Nenhum palpite registrado para este jogo.</p>
                                                                )}
                                                                {Array.isArray(rows) && rows.length > 0 && (
                                                                    <div className="overflow-x-auto">
                                                                        <table className="min-w-full text-xs">
                                                                            <thead>
                                                                                <tr className="text-left text-muted-foreground">
                                                                                    <th className="py-1 pr-4 font-medium">Usuario</th>
                                                                                    <th className="py-1 pr-4 font-medium">Palpite</th>
                                                                                    <th className="py-1 pr-4 font-medium">Última atualização</th>
                                                                                    <th className="py-1 pr-4 font-medium">Premiacao</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {rows.map((prediction) => (
                                                                                    <tr key={prediction.id} className="border-t border-border/50">
                                                                                        <td className="py-1.5 pr-4">
                                                                                            <span className="font-medium">{prediction.user_name}</span>
                                                                                            {prediction.user_email && (
                                                                                                <span className="ml-1 text-muted-foreground">{prediction.user_email}</span>
                                                                                            )}
                                                                                        </td>
                                                                                        <td className="py-1.5 pr-4 font-semibold">
                                                                                            {prediction.home_score} x {prediction.away_score}
                                                                                        </td>
                                                                                        <td className="py-1.5 pr-4 text-muted-foreground">
                                                                                            {prediction.updated_at ? fmtDateTimeBr(prediction.updated_at) : '-'}
                                                                                        </td>
                                                                                        <td className="py-1.5 pr-4">
                                                                                            <div className="flex flex-wrap gap-1">
                                                                                                {/* Prizes are mutually exclusive: exact score takes precedence over winner goals. */}
                                                                                                {prediction.exact_score_rewarded ? (
                                                                                                    <span className="rounded-sm bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-800">Placar exato</span>
                                                                                                ) : prediction.winner_goals_rewarded ? (
                                                                                                    <span className="rounded-sm bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-800">Gols vencedor</span>
                                                                                                ) : (
                                                                                                    <span className="text-muted-foreground">-</span>
                                                                                                )}
                                                                                            </div>
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    )}
                                                </Fragment>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </div>

            {scoreModal && (
                <SetScoreModal match={scoreModal} onClose={() => setScoreModal(null)} />
            )}
        </>
    );
}
