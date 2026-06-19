import { Head } from '@inertiajs/react';
import ShareCardPreview from '@/components/share-card-preview';
import { fmtDateTimeBr } from '@/lib/date';

type Props = {
    card: {
        id: number;
        type: string;
        title: string;
        subtitle: string | null;
        payload: Record<string, unknown>;
        created_at: string | null;
        user: { id: number; name: string; email: string };
        album: { id: number; name: string; slug: string } | null;
    };
};

export default function AdminShareCardsShow({ card }: Props) {
    return (
        <>
            <Head title={`Share Card #${card.id}`} />

            <div className="space-y-4 p-4">
                <h1 className="text-xl font-semibold tracking-tight">Share Card #{card.id}</h1>

                <div className="grid gap-3 rounded-sm border p-4 md:grid-cols-4 text-sm">
                    <div><span className="text-xs uppercase text-muted-foreground">Usuário</span><div>{card.user.email}</div></div>
                    <div><span className="text-xs uppercase text-muted-foreground">Tipo</span><div>{card.type}</div></div>
                    <div><span className="text-xs uppercase text-muted-foreground">Álbum</span><div>{card.album?.name ?? '-'}</div></div>
                    <div><span className="text-xs uppercase text-muted-foreground">Criado em</span><div>{fmtDateTimeBr(card.created_at)}</div></div>
                </div>

                <ShareCardPreview payload={card.payload} />

                <div className="rounded-sm border p-4">
                    <div className="text-xs uppercase text-muted-foreground">Payload</div>
                    <pre className="mt-2 overflow-x-auto text-xs">{JSON.stringify(card.payload, null, 2)}</pre>
                </div>
            </div>
        </>
    );
}
