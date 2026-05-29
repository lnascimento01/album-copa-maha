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
        <div className="brand-grid brand-app-bg min-h-screen p-4 lg:p-6">
            <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-xl border border-border bg-card/95 shadow-[0_24px_42px_-30px_rgba(10,41,71,0.55)] lg:grid-cols-[1.1fr_1fr]">
                <AuthBrandPanel />

                <main className="relative flex items-center justify-center p-6 sm:p-10">
                    <div className="absolute top-4 right-4">
                        <ThemeToggle compact />
                    </div>

                    <div className="w-full max-w-md">
                        <Link
                            href={home()}
                            className="mb-6 inline-flex items-center gap-2 rounded-sm border border-border bg-card px-3 py-2 text-xs font-semibold tracking-[0.12em] uppercase text-foreground"
                        >
                            <AppLogoIcon className="size-6" />
                            Álbum da Copa AAPH
                        </Link>

                        <div className="brand-title-strip mb-6">
                            <h1 className="text-2xl font-semibold text-foreground sm:text-[1.75rem]">{title}</h1>
                            <p className="mt-2 text-sm leading-relaxed text-dim">{description}</p>
                        </div>

                        <div className="surface-card rounded-lg p-5 sm:p-6">{children}</div>
                    </div>
                </main>
            </div>
        </div>
    );
}
