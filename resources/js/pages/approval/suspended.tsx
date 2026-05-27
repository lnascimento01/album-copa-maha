import { Head } from '@inertiajs/react';
import AuthStatusPage from '@/components/auth/auth-status-page';

export default function SuspendedAccountPage() {
    return (
        <>
            <Head title="Conta suspensa" />
            <AuthStatusPage
                badge="Conta suspensa"
                description="Seu acesso está temporariamente suspenso. Entre em contato com a administração para regularização."
            />
        </>
    );
}

SuspendedAccountPage.layout = {
    title: 'Conta temporariamente suspensa',
    description: 'Enquanto a suspensão estiver ativa, o acesso ao álbum permanece bloqueado.',
};
