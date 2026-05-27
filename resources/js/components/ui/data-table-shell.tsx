import type { ReactNode } from 'react';

type Props = {
    title: string;
    subtitle?: string;
    children: ReactNode;
};

export function DataTableShell({ title, subtitle, children }: Props) {
    return (
        <section className="rounded-md border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 px-4 py-3">
                <p className="text-sm font-medium text-zinc-900">{title}</p>
                {subtitle ? <p className="text-xs text-zinc-500">{subtitle}</p> : null}
            </div>
            <div className="overflow-x-auto">{children}</div>
        </section>
    );
}
