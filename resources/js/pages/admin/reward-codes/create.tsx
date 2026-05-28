import { Head } from '@inertiajs/react';
import RewardCodeForm from './form';

type Album = { id: number; name: string; team_id?: number };

export default function AdminRewardCodeCreate({ albums, statuses, channels }: { albums: Album[]; statuses: string[]; channels: string[] }) {
    return (
        <>
            <Head title="Novo Código" />
            <div className="space-y-4 p-4">
                <h1 className="text-xl font-semibold tracking-tight">Novo Código Promocional</h1>
                <RewardCodeForm
                    initialValues={{
                        album_id: '',
                        code: '',
                        title: '',
                        description: '',
                        status: statuses[0] ?? 'draft',
                        source_channel: channels[0] ?? 'instagram',
                        reward_pack_quantity: 1,
                        reward_pack_size: 3,
                        starts_at: '',
                        expires_at: '',
                        max_total_redemptions: '',
                        max_redemptions_per_user: 1,
                    }}
                    albums={albums}
                    statuses={statuses}
                    channels={channels}
                    method="post"
                    submitUrl="/admin/reward-codes"
                    submitLabel="Criar código"
                />
            </div>
        </>
    );
}
