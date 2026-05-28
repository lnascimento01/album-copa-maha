import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import AuthBrandPanel from '@/components/auth/auth-brand-panel';
import ThemeToggle from '@/components/theme-toggle';
import { home } from '@/routes';

type Props = PropsWithChildren<{
    title: string;
    description: string;
}>;

export default function AuthShell({ children, title, description }: Props) {
    return (
        <div className="brand-grid min-h-screen bg-background p-4 lg:p-6">
            <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-lg border border-border bg-card shadow-sm lg:grid-cols-[1.1fr_1fr]">
                <AuthBrandPanel />

                <main className="relative flex items-center justify-center p-6 sm:p-10">
                    <div className="absolute top-4 right-4">
                        <ThemeToggle compact />
                    </div>

                    <div className="w-full max-w-md">
                        <Link
                            href={home()}
                            className="mb-6 inline-flex items-center gap-2 rounded-sm border border-border bg-background px-3 py-2 text-xs font-semibold tracking-[0.12em] uppercase text-foreground"
                        >
                            <AppLogoIcon className="size-4 fill-current text-primary" />
                            Álbum da Copa MAHA
                        </Link>

                        <div className="mb-6 border-l-2 border-primary pl-3">
                            <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
                            <p className="mt-2 text-sm leading-relaxed text-dim">{description}</p>
                        </div>

                        <div className="surface-card rounded-md p-5 sm:p-6">{children}</div>
                    </div>
                </main>
            </div>
        </div>
    );
}
