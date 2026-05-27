import { Head, usePage } from '@inertiajs/react';
import AuthStatusPage from '@/components/auth/auth-status-page';

export default function RejectedApprovalPage() {
    const auth = usePage().props.auth as { user?: { rejection_reason?: string | null } };

    return (
        <>
            <Head title="Cadastro não aprovado" />
            <AuthStatusPage
                badge="Acesso não liberado"
                description="Cadastro não aprovado. Entre em contato com a administração para revisão."
                reason={auth.user?.rejection_reason ?? null}
            />
        </>
    );
}

RejectedApprovalPage.layout = {
    title: 'Cadastro não aprovado',
    description: 'Seu acesso não foi liberado nesta etapa.',
};
