import { Head } from '@inertiajs/react';
import { PaginationLinks } from '@/components/ui/pagination-links';
import { fmtDateTimeBr } from '@/lib/date';

type Redemption = {
    id: number;
    redeemed_at: string | null;
    reward_code: {
        id: number;
        code: string;
        title: string;
        source_channel: string;
        reward_pack_quantity: number;
        reward_pack_size: number;
    };
    pack_count: number;
};

type PaginationLink = { url: string | null; label: string; active: boolean };

export default function RewardCodeHistory({ redemptions }: { redemptions: { data: Redemption[]; links: PaginationLink[] } }) {
    return (
        <>
            <Head title="Histórico de Códigos" />
            <div className="space-y-4 p-4">
                <h1 className="text-xl font-semibold tracking-tight">Histórico de Códigos Resgatados</h1>

                <div className="overflow-x-auto rounded-sm border">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b text-left">
                                <th className="px-4 py-2">Código</th>
                                <th className="px-4 py-2">Título</th>
                                <th className="px-4 py-2">Canal</th>
                                <th className="px-4 py-2">Recompensa</th>
                                <th className="px-4 py-2">Pacotes gerados</th>
                                <th className="px-4 py-2">Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            {redemptions.data.map((redemption) => (
                                <tr key={redemption.id} className="border-b">
                                    <td className="px-4 py-2 font-mono text-xs">{redemption.reward_code.code}</td>
                                    <td className="px-4 py-2">{redemption.reward_code.title}</td>
                                    <td className="px-4 py-2">{redemption.reward_code.source_channel}</td>
                                    <td className="px-4 py-2">{redemption.reward_code.reward_pack_quantity}x{redemption.reward_code.reward_pack_size}</td>
                                    <td className="px-4 py-2">{redemption.pack_count}</td>
                                    <td className="px-4 py-2">{fmtDateTimeBr(redemption.redeemed_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <PaginationLinks links={redemptions.links} />
            </div>
        </>
    );
}
