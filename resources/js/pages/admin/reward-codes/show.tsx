import { Head, Link, router } from '@inertiajs/react';

type RewardCode = {
    id: number;
    code: string;
    title: string;
    description: string | null;
    status: string;
    source_channel: string;
    reward_pack_quantity: number;
    reward_pack_size: number;
    starts_at: string | null;
    expires_at: string | null;
    max_total_redemptions: number | null;
    max_redemptions_per_user: number;
    redeemed_count: number;
    revoked_at: string | null;
    revoke_reason: string | null;
    album: { id: number; name: string; status: string };
    redemptions: { id: number; redeemed_at: string | null; user: { id: number; email: string } }[];
    sticker_packs: { id: number; status: string; created_at: string | null; user: { id: number; email: string } }[];
};

type AuditLog = { id: number; action: string; metadata: Record<string, unknown> | null; created_at: string | null; actor: { email: string } | null };

export default function AdminRewardCodeShow({ rewardCode, shareText, auditLogs }: { rewardCode: RewardCode; shareText: string; auditLogs: AuditLog[] }) {
    const activate = () => {
        router.patch(`/admin/reward-codes/${rewardCode.id}/activate`);
    };

    const revoke = () => {
        const reason = window.prompt('Motivo da revogação:');

        if (!reason) {
            return;
        }

        router.patch(`/admin/reward-codes/${rewardCode.id}/revoke`, {
            revoke_reason: reason,
        });
    };

    return (
        <>
            <Head title={`Código ${rewardCode.code}`} />
            <div className="space-y-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h1 className="text-xl font-semibold tracking-tight">Código {rewardCode.code}</h1>
                    <div className="flex gap-2">
                        <Link href={`/admin/reward-codes/${rewardCode.id}/edit`} className="cursor-pointer rounded-sm border px-3 py-2 text-xs transition-colors hover:bg-accent">Editar</Link>
                        <button type="button" onClick={activate} className="cursor-pointer rounded-sm border px-3 py-2 text-xs transition-colors hover:bg-accent">Ativar</button>
                        <button type="button" onClick={revoke} className="cursor-pointer rounded-sm border px-3 py-2 text-xs transition-colors hover:bg-accent">Revogar</button>
                    </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Título:</span> {rewardCode.title}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Canal:</span> {rewardCode.source_channel}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Status:</span> {rewardCode.status}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Álbum:</span> {rewardCode.album.name}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Recompensa:</span> {rewardCode.reward_pack_quantity} pacote(s) de {rewardCode.reward_pack_size}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Resgates:</span> {rewardCode.redeemed_count}{rewardCode.max_total_redemptions ? `/${rewardCode.max_total_redemptions}` : ''}</div>
                </div>

                <div className="rounded-sm border p-4">
                    <div className="text-xs uppercase text-muted-foreground">Texto sugerido para divulgação</div>
                    <pre className="mt-2 whitespace-pre-wrap text-sm">{shareText}</pre>
                </div>

                <div className="rounded-sm border">
                    <div className="border-b px-4 py-3 text-sm font-medium">Resgates recentes</div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="px-4 py-2">ID</th>
                                    <th className="px-4 py-2">Usuário</th>
                                    <th className="px-4 py-2">Data</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rewardCode.redemptions.map((redemption) => (
                                    <tr key={redemption.id} className="border-b">
                                        <td className="px-4 py-2">#{redemption.id}</td>
                                        <td className="px-4 py-2">{redemption.user.email}</td>
                                        <td className="px-4 py-2">{redemption.redeemed_at ?? '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="rounded-sm border">
                    <div className="border-b px-4 py-3 text-sm font-medium">Auditoria</div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="px-4 py-2">Ação</th>
                                    <th className="px-4 py-2">Ator</th>
                                    <th className="px-4 py-2">Data</th>
                                    <th className="px-4 py-2">Metadata</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditLogs.map((log) => (
                                    <tr key={log.id} className="border-b align-top">
                                        <td className="px-4 py-2 font-mono text-xs">{log.action}</td>
                                        <td className="px-4 py-2">{log.actor?.email ?? '-'}</td>
                                        <td className="px-4 py-2">{log.created_at ?? '-'}</td>
                                        <td className="px-4 py-2"><pre className="max-w-[420px] overflow-x-auto text-xs">{JSON.stringify(log.metadata ?? {}, null, 2)}</pre></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
