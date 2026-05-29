import { Head, Link, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { DataTableShell } from '@/components/ui/data-table-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { ResponsiveDataList } from '@/components/ui/responsive-data-list';

type RedemptionRow = {
    id: number;
    redeemed_at: string | null;
    reward_code: { id: number; code: string; title: string; source_channel: string };
};

type Flash = {
    success?: string;
    redeemResult?: {
        redemption_id: number;
        pack_ids: number[];
    };
};

export default function RewardCodeRedeemPage({ recentRedemptions, activeAlbum }: { recentRedemptions: RedemptionRow[]; activeAlbum: { id: number; name: string } | null }) {
    const page = usePage<{ flash?: Flash }>();
    const form = useForm({
        code: '',
        album_id: activeAlbum?.id ?? null,
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post('/reward-code');
    };

    return (
        <>
            <Head title="Resgatar Código" />
            <div className="brand-app-bg space-y-4 p-4 sm:p-5">
                <PageHeader
                    title="Resgatar Código Promocional"
                    subtitle="Digite o código divulgado pelo time para receber novos pacotes no Álbum da Copa AAPH."
                    actions={<Link href="/reward-codes/history" className="rounded-sm border border-border bg-card px-3 py-2 text-xs font-semibold">Histórico completo</Link>}
                />

                <section className="season-hero">
                    <div className="relative z-10">
                        <p className="season-kicker">Campanha da temporada</p>
                        <h2 className="mt-2 text-2xl font-semibold text-foreground">Ativações e códigos AAPH</h2>
                        <p className="mt-1 max-w-2xl text-sm text-dim">
                            Digite o código oficial divulgado nas ações do time e receba pacotes extras no álbum.
                        </p>
                    </div>
                </section>

                <form onSubmit={submit} className="form-panel space-y-3 md:max-w-xl">
                    <div className="form-panel-muted px-3 py-2 text-xs">
                        Escopo de resgate atual: {activeAlbum?.name ?? 'Nenhum álbum ativo'}
                    </div>
                    <div>
                        <Label htmlFor="code" className="text-xs font-semibold tracking-[0.1em] uppercase">Código</Label>
                        <Input
                            id="code"
                            value={form.data.code}
                            onChange={(event) => form.setData('code', event.target.value)}
                            className="mt-1 font-mono"
                            placeholder="Ex.: AAPH10"
                        />
                        {form.errors.code ? <div className="mt-1 text-xs text-red-700 dark:text-red-300">{form.errors.code}</div> : null}
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <Button type="submit" disabled={form.processing}>
                            Resgatar código
                        </Button>
                        <Link href="/packs" className="text-xs font-semibold text-primary hover:underline">Meus pacotes</Link>
                    </div>
                </form>

                {page.props.flash?.success ? (
                    <div className="rounded-md border border-[color:var(--brand-secondary)]/45 bg-[color:var(--brand-secondary)]/12 p-4 text-sm">
                        <div className="font-medium text-foreground">{page.props.flash.success}</div>
                        <div className="mt-1 text-dim">Pacotes gerados: {(page.props.flash.redeemResult?.pack_ids ?? []).join(', ') || '-'}</div>
                        <div className="mt-2 text-xs">
                            <Link href="/packs" className="underline">Ir para meus pacotes</Link>
                        </div>
                    </div>
                ) : null}

                <DataTableShell title="Histórico recente" subtitle="Últimos códigos resgatados na sua conta.">
                    <ResponsiveDataList
                        items={recentRedemptions}
                        getKey={(item) => item.id}
                        empty={<EmptyState title="Nenhum código resgatado ainda." />}
                        renderItem={(item) => (
                            <div className="space-y-2">
                                <p className="font-mono text-xs text-dim">{item.reward_code.code}</p>
                                <p className="text-sm font-semibold text-foreground">{item.reward_code.title}</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="responsive-data-key">Canal</p>
                                        <p className="responsive-data-value">{item.reward_code.source_channel}</p>
                                    </div>
                                    <div>
                                        <p className="responsive-data-key">Data</p>
                                        <p className="responsive-data-value">{item.redeemed_at ?? '-'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    />
                    <table className="hidden min-w-full text-sm md:table">
                        <thead>
                            <tr className="border-b border-border text-left">
                                <th className="px-4 py-2">Código</th>
                                <th className="px-4 py-2">Título</th>
                                <th className="px-4 py-2">Canal</th>
                                <th className="px-4 py-2">Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentRedemptions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8">
                                        <EmptyState title="Nenhum código resgatado ainda." />
                                    </td>
                                </tr>
                            ) : (
                                recentRedemptions.map((item) => (
                                    <tr key={item.id} className="admin-table-row">
                                        <td className="px-4 py-2 font-mono text-xs text-dim">{item.reward_code.code}</td>
                                        <td className="px-4 py-2 text-foreground">{item.reward_code.title}</td>
                                        <td className="px-4 py-2 text-dim">{item.reward_code.source_channel}</td>
                                        <td className="px-4 py-2 text-dim">{item.redeemed_at ?? '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </DataTableShell>
            </div>
        </>
    );
}
