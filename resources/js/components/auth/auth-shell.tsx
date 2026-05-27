import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import AuthBrandPanel from '@/components/auth/auth-brand-panel';
import { home } from '@/routes';

type Props = PropsWithChildren<{
    title: string;
    description: string;
}>;

export default function AuthShell({ children, title, description }: Props) {
    return (
        <div className="min-h-screen bg-neutral-200 p-4 lg:p-6">
            <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl border border-neutral-900 bg-white lg:grid-cols-[1.1fr_1fr]">
                <AuthBrandPanel />

                <main className="flex items-center justify-center p-6 sm:p-10">
                    <div className="w-full max-w-md">
                        <Link
                            href={home()}
                            className="mb-6 inline-flex items-center gap-2 border border-neutral-900 bg-white px-3 py-2 text-xs font-semibold tracking-[0.12em] uppercase"
                        >
                            <AppLogoIcon className="size-4 fill-current" />
                            Álbum da Copa MAHA
                        </Link>

                        <div className="mb-6 border-l-2 border-neutral-900 pl-3">
                            <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
                            <p className="mt-2 text-sm leading-relaxed text-neutral-600">{description}</p>
                        </div>

                        <div className="border border-neutral-300 bg-white p-5 sm:p-6">{children}</div>
                    </div>
                </main>
            </div>
        </div>
    );
}
