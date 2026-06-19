import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { fmtDateTimeBr } from '@/lib/date';
import { DataTableShell } from '@/components/ui/data-table-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { OriginBadge } from '@/components/ui/origin-badge';
import { PageHeader } from '@/components/ui/page-header';
import { ResponsiveDataList } from '@/components/ui/responsive-data-list';
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
            <div className="brand-app-bg space-y-4 p-4 sm:p-5">
                <PageHeader
                    title="Pacotes"
                    subtitle="Concessão, rastreabilidade de origem e estado operacional dos pacotes."
                    actions={<Link href="/admin/sticker-packs/create" className="rounded-sm border border-primary bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">Conceder pacotes</Link>}
                />

                <form onSubmit={submit} className="album-paper grid gap-3 p-4 md:grid-cols-6">
                    <div>
                        <label className="text-xs font-semibold tracking-[0.1em] text-dim uppercase">Usuário</label>
                        <select className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" value={userId} onChange={(event) => setUserId(event.target.value)}>
                            <option value="">Todos</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>{user.email}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold tracking-[0.1em] text-dim uppercase">Álbum</label>
                        <select className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" value={albumId} onChange={(event) => setAlbumId(event.target.value)}>
                            <option value="">Todos</option>
                            {albums.map((album) => (
                                <option key={album.id} value={album.id}>{album.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold tracking-[0.1em] text-dim uppercase">Status</label>
                        <select className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
                            <option value="">Todos</option>
                            {statuses.map((item) => (
                                <option key={item} value={item}>{item}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold tracking-[0.1em] text-dim uppercase">Origem</label>
                        <select className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" value={source} onChange={(event) => setSource(event.target.value)}>
                            <option value="">Todos</option>
                            {sources.map((item) => (
                                <option key={item} value={item}>{item}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold tracking-[0.1em] text-dim uppercase">De</label>
                        <input type="date" className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs font-semibold tracking-[0.1em] text-dim uppercase">Até</label>
                        <input type="date" className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
                    </div>
                    <div className="md:col-span-6 flex justify-end">
                        <button className="cursor-pointer rounded-sm border border-primary bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110" type="submit">Filtrar</button>
                    </div>
                </form>

                <DataTableShell title="Pacotes registrados" subtitle="Inclui pacotes manuais, check-in, código promocional e missão social.">
                    <ResponsiveDataList
                        items={packs.data}
                        getKey={(pack) => pack.id}
                        empty={<EmptyState title="Nenhum pacote encontrado." />}
                        renderItem={(pack) => (
                            <div className="space-y-2">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-foreground">Pacote #{pack.id}</p>
                                        <p className="mt-1 text-xs text-dim">{pack.user.email}</p>
                                    </div>
                                    <StatusBadge value={pack.status} />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="responsive-data-key">Álbum</p>
                                        <p className="responsive-data-value">{pack.album.name}</p>
                                    </div>
                                    <div>
                                        <p className="responsive-data-key">Tamanho</p>
                                        <p className="responsive-data-value">{pack.size}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="responsive-data-key">Origem</p>
                                        <div className="mt-1"><OriginBadge source={pack.source} label={sourceLabel(pack)} /></div>
                                    </div>
                                    <div>
                                        <p className="responsive-data-key">Criado em</p>
                                        <p className="responsive-data-value">{fmtDateTimeBr(pack.created_at)}</p>
                                    </div>
                                    <div>
                                        <p className="responsive-data-key">Aberto em</p>
                                        <p className="responsive-data-value">{fmtDateTimeBr(pack.opened_at)}</p>
                                    </div>
                                </div>
                                <div className="pt-1">
                                    <Link href={`/admin/sticker-packs/${pack.id}`} className="app-link-chip">Detalhes</Link>
                                </div>
                            </div>
                        )}
                    />
                    <table className="hidden min-w-full text-sm md:table">
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
                                    <tr key={pack.id} className="admin-table-row">
                                        <td className="px-4 py-2 font-mono text-xs text-dim">#{pack.id}</td>
                                        <td className="px-4 py-2 text-foreground">{pack.user.email}</td>
                                        <td className="px-4 py-2 text-dim">{pack.album.name}</td>
                                        <td className="px-4 py-2"><StatusBadge value={pack.status} /></td>
                                        <td className="px-4 py-2 text-dim">{pack.size}</td>
                                        <td className="px-4 py-2"><OriginBadge source={pack.source} label={sourceLabel(pack)} /></td>
                                        <td className="px-4 py-2 text-dim">{pack.granted_by_user?.email ?? '-'}</td>
                                        <td className="px-4 py-2 text-dim">{fmtDateTimeBr(pack.created_at)}</td>
                                        <td className="px-4 py-2 text-dim">{fmtDateTimeBr(pack.opened_at)}</td>
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
                            className={`rounded-sm border px-2 py-1 text-xs font-semibold ${link.active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-dim'}`}
                        >
                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
