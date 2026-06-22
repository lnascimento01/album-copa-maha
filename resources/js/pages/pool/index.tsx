import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { fmtDateTimeBr } from '@/lib/date';

type PoolPrediction = {
    id: number;
    home_score: number;
    away_score: number;
    exact_score_rewarded: boolean;
    winner_goals_rewarded: boolean;
};

type PoolMatch = {
    id: number;
    match_number: number;
    stage: string;
    group_name: string | null;
    home_team: string;
    away_team: string;
    starts_at: string;
    venue: string | null;
    city: string | null;
    is_locked: boolean;
    home_score: number | null;
    away_score: number | null;
    prediction: PoolPrediction | null;
};

type Settings = {
    exact_score_pack_size: number;
    winner_goals_pack_size: number;
};

type Props = {
    matchesByDate: Record<string, PoolMatch[]>;
    dates: string[];
    settings: Settings;
};

function predictionBadge(prediction: PoolPrediction, match: PoolMatch): string {
    if (match.home_score === null) return '';
    if (prediction.exact_score_rewarded) return 'Acertou exato';
    if (prediction.winner_goals_rewarded) return 'Acertou gols';
    return 'Errou';
}

function MatchCard({ match }: { match: PoolMatch }) {
    const [homeInput, setHomeInput] = useState<string>(
        match.prediction !== null ? String(match.prediction.home_score) : '',
    );
    const [awayInput, setAwayInput] = useState<string>(
        match.prediction !== null ? String(match.prediction.away_score) : '',
    );

    const savePrediction = () => {
        if (homeInput === '' || awayInput === '') return;
        router.post(
            '/pool/predictions',
            {
                match_id: match.id,
                home_score: parseInt(homeInput, 10),
                away_score: parseInt(awayInput, 10),
            },
            { preserveScroll: true },
        );
    };

    const badge = match.prediction && match.is_locked && match.home_score !== null
        ? predictionBadge(match.prediction, match)
        : null;

    return (
        <div className="rounded-sm border p-4">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>#{match.match_number} {match.group_name ? `Grupo ${match.group_name}` : match.stage}</span>
                <span>{fmtDateTimeBr(match.starts_at)}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
                <span className="flex-1 text-sm font-medium">{match.home_team}</span>

                {match.is_locked && match.home_score !== null ? (
                    <div className="flex items-center gap-2 text-base font-bold">
                        <span>{match.home_score}</span>
                        <span className="text-muted-foreground">x</span>
                        <span>{match.away_score}</span>
                    </div>
                ) : match.is_locked ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{match.prediction ? match.prediction.home_score : '-'}</span>
                        <span>x</span>
                        <span>{match.prediction ? match.prediction.away_score : '-'}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min={0}
                            max={20}
                            value={homeInput}
                            onChange={(event) => setHomeInput(event.target.value)}
                            className="rounded-sm border px-2 py-1 text-center text-sm"
                            style={{ width: '3rem' }}
                        />
                        <span className="text-muted-foreground">x</span>
                        <input
                            type="number"
                            min={0}
                            max={20}
                            value={awayInput}
                            onChange={(event) => setAwayInput(event.target.value)}
                            className="rounded-sm border px-2 py-1 text-center text-sm"
                            style={{ width: '3rem' }}
                        />
                    </div>
                )}

                <span className="flex-1 text-right text-sm font-medium">{match.away_team}</span>
            </div>

            {match.city && (
                <div className="mt-1 text-xs text-muted-foreground">{match.venue ? `${match.venue}, ` : ''}{match.city}</div>
            )}

            {badge && (
                <div className="mt-2">
                    <span className={`rounded-sm px-2 py-1 text-xs font-medium ${badge === 'Acertou exato' ? 'bg-green-100 text-green-800' : badge === 'Acertou gols' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {badge}
                    </span>
                    {match.prediction && (
                        <span className="ml-2 text-xs text-muted-foreground">
                            Seu palpite: {match.prediction.home_score} x {match.prediction.away_score}
                        </span>
                    )}
                </div>
            )}

            {match.is_locked && match.home_score === null && match.prediction && (
                <div className="mt-2 text-xs text-muted-foreground">
                    Seu palpite (bloqueado): {match.prediction.home_score} x {match.prediction.away_score}
                </div>
            )}

            {!match.is_locked && (
                <div className="mt-3">
                    <button
                        type="button"
                        onClick={savePrediction}
                        disabled={homeInput === '' || awayInput === ''}
                        className="cursor-pointer rounded-sm border bg-primary px-3 py-1 text-xs text-primary-foreground transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Salvar
                    </button>
                    {match.prediction && (
                        <span className="ml-2 text-xs text-muted-foreground">
                            Palpite atual: {match.prediction.home_score} x {match.prediction.away_score}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

export default function PoolIndex({ matchesByDate, dates, settings }: Props) {
    const [selectedDate, setSelectedDate] = useState<string>(dates[0] ?? '');

    const formatDateLabel = (dateStr: string): string => {
        const date = new Date(dateStr + 'T12:00:00');
        return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
    };

    const currentMatches = selectedDate ? (matchesByDate[selectedDate] ?? []) : [];

    return (
        <>
            <Head title="Bolao Copa 2026" />
            <div className="space-y-4 p-4">
                <h1 className="text-xl font-semibold tracking-tight">Bolao Copa 2026</h1>

                {dates.length === 0 ? (
                    <div className="rounded-sm border p-8 text-center text-sm text-muted-foreground">
                        Nenhum jogo disponivel no momento.
                    </div>
                ) : (
                    <>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {dates.map((date) => (
                                <button
                                    key={date}
                                    type="button"
                                    onClick={() => setSelectedDate(date)}
                                    className={`cursor-pointer whitespace-nowrap rounded-sm border px-3 py-2 text-xs transition-colors ${selectedDate === date ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                                >
                                    {formatDateLabel(date)}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-3">
                            {currentMatches.map((match) => (
                                <MatchCard key={match.id} match={match} />
                            ))}
                        </div>

                        <div className="rounded-sm border p-4 text-sm">
                            <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Regras de premiacao</div>
                            <ul className="space-y-1 text-sm">
                                <li>Acerto exato (placar correto): <strong>{settings.exact_score_pack_size} figurinhas</strong></li>
                                <li>Acerto dos gols do vencedor (com mesmo time ganhando): <strong>{settings.winner_goals_pack_size} figurinhas</strong></li>
                                <li>Os palpites ficam bloqueados no horario de inicio do jogo.</li>
                                <li>Pacotes sao concedidos automaticamente apos o placar ser confirmado.</li>
                            </ul>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
