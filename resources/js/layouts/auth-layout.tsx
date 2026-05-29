import AuthShell from '@/components/auth/auth-shell';

export default function AuthLayout({
    title = 'Acesso à Temporada',
    description = 'Acesse sua conta para acompanhar a temporada do Álbum da Copa AAPH.',
    children,
}: {
    title?: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <AuthShell title={title} description={description}>
            {children}
        </AuthShell>
    );
}
