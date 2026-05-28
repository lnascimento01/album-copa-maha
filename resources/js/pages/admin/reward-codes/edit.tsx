import { Head } from '@inertiajs/react';
import RewardCodeForm from './form';

type Album = { id: number; name: string; team_id?: number };
type RewardCode = {
    id: number;
    album_id: number;
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
};

export default function AdminRewardCodeEdit({ rewardCode, albums, statuses, channels }: { rewardCode: RewardCode; albums: Album[]; statuses: string[]; channels: string[] }) {
    return (
        <>
            <Head title={`Editar Código - ${rewardCode.code}`} />
            <div className="space-y-4 p-4">
                <h1 className="text-xl font-semibold tracking-tight">Editar Código Promocional</h1>
                <RewardCodeForm
                    initialValues={{
                        album_id: rewardCode.album_id,
                        code: rewardCode.code,
                        title: rewardCode.title,
                        description: rewardCode.description ?? '',
                        status: rewardCode.status,
                        source_channel: rewardCode.source_channel,
                        reward_pack_quantity: rewardCode.reward_pack_quantity,
                        reward_pack_size: rewardCode.reward_pack_size,
                        starts_at: rewardCode.starts_at ?? '',
                        expires_at: rewardCode.expires_at ?? '',
                        max_total_redemptions: rewardCode.max_total_redemptions ?? '',
                        max_redemptions_per_user: rewardCode.max_redemptions_per_user,
                    }}
                    albums={albums}
                    statuses={statuses}
                    channels={channels}
                    method="patch"
                    submitUrl={`/admin/reward-codes/${rewardCode.id}`}
                    submitLabel="Salvar alterações"
                />
            </div>
        </>
    );
}
