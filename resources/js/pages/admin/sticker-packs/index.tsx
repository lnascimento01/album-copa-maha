import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { DataTableShell } from '@/components/ui/data-table-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { OriginBadge } from '@/components/ui/origin-badge';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';

type UserOption = { id: number; name: string; email: string };
type AlbumOption = { id: number; name: string };

type PackRow = {
    id: number;
    status: string;
    size: number;
    source: string;
    created_at: string | null;
    opened_at: string | null;
    user: UserOption;
    album: AlbumOption;
    activity?: { id: number; title: string; type: string; status: string } | null;
    reward_code?: { id: number; code: string; title: string } | null;
    social_mission?: { id: number; title: string; slug: string } | null;
    granted_by_user: UserOption | null;
};

type PaginationLink = { url: string | null; label: string; active: boolean };

type Props = {
    packs: { data: PackRow[]; links: PaginationLink[] };
    filters: { user_id: number | null; album_id: number | null; status: string; source: string; date_from: string; date_to: string };
    users: UserOption[];
    albums: AlbumOption[];
    statuses: string[];
    sources: string[];
};

export default function AdminStickerPacksIndex({ packs, filters, users, albums, statuses, sources }: Props) {
    const [userId, setUserId] = useState<string>(filters.user_id ? String(filters.user_id) : '');
    const [albumId, setAlbumId] = useState<string>(filters.album_id ? String(filters.album_id) : '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [source, setSource] = useState(filters.source ?? '');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.get('/admin/sticker-packs', {
            user_id: userId,
            album_id: albumId,
            status,
            source,
            date_from: dateFrom,
            date_to: dateTo,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const sourceLabel = (pack: PackRow) => {
        if (pack.source === 'checkin' && pack.activity) {
            return `Check-in: ${pack.activity.title}`;
        }

        if (pack.source === 'reward_code' && pack.reward_code) {
            return `Código: ${pack.reward_code.code}`;
        }

        if (pack.source === 'social_mission' && pack.social_mission) {
            return `Missão: ${pack.social_mission.title}`;
        }

        return pack.source;
    };

    return (
        <>
            <Head title="Pacotes" />
            <div className="space-y-4 p-4 sm:p-5">
                <PageHeader
                    title="Pacotes"
                    subtitle="Concessão, rastreabilidade de origem e estado operacional dos pacotes."
                    actions={<Link href="/admin/sticker-packs/create" className="rounded-sm border bg-primary px-3 py-2 text-xs text-primary-foreground">Conceder pacotes</Link>}
                />

                <form onSubmit={submit} className="grid gap-3 rounded-md border border-border bg-card p-4 md:grid-cols-6">
                    <div>
                        <label className="text-xs uppercase tracking-wide text-dim">Usuário</label>
                        <select className="mt-1 w-full rounded-sm border bg-card border-border px-2 py-2 text-sm" value={userId} onChange={(event) => setUserId(event.target.value)}>
                            <option value="">Todos</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>{user.email}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-wide text-dim">Álbum</label>
                        <select className="mt-1 w-full rounded-sm border bg-card border-border px-2 py-2 text-sm" value={albumId} onChange={(event) => setAlbumId(event.target.value)}>
                            <option value="">Todos</option>
                            {albums.map((album) => (
                                <option key={album.id} value={album.id}>{album.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-wide text-dim">Status</label>
                        <select className="mt-1 w-full rounded-sm border bg-card border-border px-2 py-2 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
                            <option value="">Todos</option>
                            {statuses.map((item) => (
                                <option key={item} value={item}>{item}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-wide text-dim">Origem</label>
                        <select className="mt-1 w-full rounded-sm border bg-card border-border px-2 py-2 text-sm" value={source} onChange={(event) => setSource(event.target.value)}>
                            <option value="">Todos</option>
                            {sources.map((item) => (
                                <option key={item} value={item}>{item}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-wide text-dim">De</label>
                        <input type="date" className="mt-1 w-full rounded-sm border bg-card border-border px-2 py-2 text-sm" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-wide text-dim">Até</label>
                        <input type="date" className="mt-1 w-full rounded-sm border bg-card border-border px-2 py-2 text-sm" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
                    </div>
                    <div className="md:col-span-6 flex justify-end">
                        <button className="rounded-sm border bg-primary px-3 py-2 text-sm text-primary-foreground" type="submit">Filtrar</button>
                    </div>
                </form>

                <DataTableShell title="Pacotes registrados" subtitle="Inclui pacotes manuais, check-in, código promocional e missão social.">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-border text-left">
                                <th className="px-4 py-2">ID</th>
                                <th className="px-4 py-2">Usuário</th>
                                <th className="px-4 py-2">Álbum</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Size</th>
                                <th className="px-4 py-2">Origem</th>
                                <th className="px-4 py-2">Concedido por</th>
                                <th className="px-4 py-2">Criado em</th>
                                <th className="px-4 py-2">Aberto em</th>
                                <th className="px-4 py-2">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {packs.data.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-8">
                                        <EmptyState title="Nenhum pacote encontrado." />
                                    </td>
                                </tr>
                            ) : (
                                packs.data.map((pack) => (
                                    <tr key={pack.id} className="border-b border-border/60">
                                        <td className="px-4 py-2 font-mono text-xs text-dim">#{pack.id}</td>
                                        <td className="px-4 py-2 text-foreground">{pack.user.email}</td>
                                        <td className="px-4 py-2 text-dim">{pack.album.name}</td>
                                        <td className="px-4 py-2"><StatusBadge value={pack.status} /></td>
                                        <td className="px-4 py-2 text-dim">{pack.size}</td>
                                        <td className="px-4 py-2"><OriginBadge source={pack.source} label={sourceLabel(pack)} /></td>
                                        <td className="px-4 py-2 text-dim">{pack.granted_by_user?.email ?? '-'}</td>
                                        <td className="px-4 py-2 text-dim">{pack.created_at ?? '-'}</td>
                                        <td className="px-4 py-2 text-dim">{pack.opened_at ?? '-'}</td>
                                        <td className="px-4 py-2">
                                            <Link href={`/admin/sticker-packs/${pack.id}`} className="text-xs underline">Detalhes</Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </DataTableShell>

                <div className="flex flex-wrap gap-2">
                    {packs.links.map((link, index) => (
                        <button
                            key={`${link.label}-${index}`}
                            type="button"
                            onClick={() => {
                                if (link.url) {
                                    router.visit(link.url);
                                }
                            }}
                            disabled={!link.url}
                            className={`rounded-sm border px-2 py-1 text-xs ${link.active ? 'bg-primary text-primary-foreground' : 'bg-white text-dim'}`}
                        >
                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
