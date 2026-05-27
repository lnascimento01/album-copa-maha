import { Head, Link, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { DataTableShell } from '@/components/ui/data-table-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';

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

export default function RewardCodeRedeemPage({ recentRedemptions }: { recentRedemptions: RedemptionRow[] }) {
    const page = usePage<{ flash?: Flash }>();
    const form = useForm({
        code: '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post('/reward-code');
    };

    return (
        <>
            <Head title="Resgatar Código" />
            <div className="space-y-4 p-4 sm:p-5">
                <PageHeader
                    title="Resgatar Código Promocional"
                    subtitle="Digite o código divulgado pelo time para receber novos pacotes."
                    actions={<Link href="/reward-codes/history" className="rounded-sm border border-zinc-300 px-3 py-2 text-xs">Histórico completo</Link>}
                />

                <form onSubmit={submit} className="space-y-3 rounded-md border border-zinc-200 bg-white p-4 md:max-w-xl">
                    <div>
                        <label htmlFor="code" className="text-xs uppercase tracking-wide text-zinc-500">Código</label>
                        <input
                            id="code"
                            value={form.data.code}
                            onChange={(event) => form.setData('code', event.target.value)}
                            className="mt-1 w-full rounded-sm border border-zinc-300 px-2 py-2 text-sm font-mono"
                            placeholder="Ex.: MAHA10"
                        />
                        {form.errors.code ? <div className="mt-1 text-xs text-red-700">{form.errors.code}</div> : null}
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <button type="submit" disabled={form.processing} className="rounded-sm border bg-zinc-950 px-3 py-2 text-sm text-white">
                            Resgatar código
                        </button>
                        <Link href="/packs" className="text-xs underline">Meus pacotes</Link>
                    </div>
                </form>

                {page.props.flash?.success ? (
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm">
                        <div className="font-medium text-emerald-900">{page.props.flash.success}</div>
                        <div className="mt-1 text-emerald-800">Pacotes gerados: {(page.props.flash.redeemResult?.pack_ids ?? []).join(', ') || '-'}</div>
                        <div className="mt-2 text-xs">
                            <Link href="/packs" className="underline">Ir para meus pacotes</Link>
                        </div>
                    </div>
                ) : null}

                <DataTableShell title="Histórico recente" subtitle="Últimos códigos resgatados na sua conta.">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-zinc-200 text-left">
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
                                    <tr key={item.id} className="border-b border-zinc-100">
                                        <td className="px-4 py-2 font-mono text-xs text-zinc-700">{item.reward_code.code}</td>
                                        <td className="px-4 py-2 text-zinc-800">{item.reward_code.title}</td>
                                        <td className="px-4 py-2 text-zinc-700">{item.reward_code.source_channel}</td>
                                        <td className="px-4 py-2 text-zinc-600">{item.redeemed_at ?? '-'}</td>
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
