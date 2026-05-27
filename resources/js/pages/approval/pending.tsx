import { Head } from '@inertiajs/react';
import AuthStatusPage from '@/components/auth/auth-status-page';

export default function PendingApprovalPage() {
    return (
        <>
            <Head title="Cadastro pendente" />
            <AuthStatusPage
                badge="Inscrição recebida"
                description="Seu cadastro foi enviado para aprovação. Assim que um admin liberar, você poderá acessar o álbum."
            />
        </>
    );
}

PendingApprovalPage.layout = {
    title: 'Cadastro enviado para aprovação',
    description: 'A administração precisa liberar seu acesso antes de você participar.',
};
