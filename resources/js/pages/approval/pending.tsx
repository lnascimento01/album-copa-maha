import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import AuthStatusPage from '@/components/auth/auth-status-page';

export default function PendingApprovalPage() {
    const page = usePage<{ auth: { user?: { approval_status?: string } } }>();
    const [lastCheckAt, setLastCheckAt] = useState<string | null>(null);
    const [status, setStatus] = useState(page.props.auth.user?.approval_status ?? 'pending');

    const isPending = useMemo(() => status === 'pending', [status]);

    useEffect(() => {
        if (!isPending) {
            return;
        }

        const poll = async () => {
            try {
                const response = await window.fetch('/approval/status', {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                if (!response.ok) {
                    return;
                }

                const data = await response.json();
                const currentStatus = data?.approval_status as string | undefined;

                if (!currentStatus) {
                    return;
                }

                setStatus(currentStatus);
                setLastCheckAt(new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' }));

                if (currentStatus === 'approved') {
                    router.visit('/dashboard');
                } else if (currentStatus === 'rejected') {
                    router.visit('/approval/rejected');
                } else if (currentStatus === 'suspended') {
                    router.visit('/approval/suspended');
                }
            } catch {
                // Keep polling silently, avoid blocking pending screen.
            }
        };

        poll();
        const interval = window.setInterval(poll, 7000);

        return () => window.clearInterval(interval);
    }, [isPending]);

    return (
        <>
            <Head title="Cadastro pendente" />
            <AuthStatusPage
                badge="Inscrição recebida"
                description="Seu cadastro foi enviado para aprovação. Assim que a administração liberar, você poderá folhear o Álbum da Copa AAPH."
                extraInfo={lastCheckAt ? `Última verificação automática: ${lastCheckAt}` : 'Verificação automática de aprovação ativa.'}
            />
        </>
    );
}

PendingApprovalPage.layout = {
    title: 'Cadastro enviado para aprovação',
    description: 'A administração precisa liberar seu acesso antes de você participar.',
};
