import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import ShareExportPanel from '@/components/share-export-panel';
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
    score_locked_at: string | null;
    predictions_count: number;
    can_set_score: boolean;
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

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.post(
            `/admin/pool/matches/${match.id}/score`,
            {
                home_score: parseInt(homeScore, 10),
                away_score: parseInt(awayScore, 10),
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
                    Esta acao e irreversivel. Os pacotes serao concedidos automaticamente.
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
                                onChange={(event) => setHomeScore(event.target.value)}
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
                                onChange={(event) => setAwayScore(event.target.value)}
                                className="w-full rounded-sm border px-2 py-2 text-center text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="cursor-pointer rounded-sm border px-3 py-2 text-xs hover:bg-accent">
                            Cancelar
                        </button>
                        <button type="submit" className="cursor-pointer rounded-sm border bg-primary px-3 py-2 text-xs text-primary-foreground transition-all hover:brightness-110">
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
                                        {stageMatches.map((match) => (
                                            <tr key={match.id} className="border-b">
                                                <td className="px-4 py-2 text-muted-foreground">{match.match_number}</td>
                                                <td className="px-4 py-2 font-medium">
                                                    {match.home_team} x {match.away_team}
                                                    {match.group_name && (
                                                        <span className="ml-2 text-xs text-muted-foreground">Gr. {match.group_name}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2 text-xs">{fmtDateTimeBr(match.starts_at)}</td>
                                                <td className="px-4 py-2 text-xs">{match.city ?? '-'}</td>
                                                <td className="px-4 py-2">{match.predictions_count}</td>
                                                <td className="px-4 py-2">
                                                    {match.home_score !== null ? (
                                                        <span className="font-semibold">{match.home_score} x {match.away_score}</span>
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
                                        ))}
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
