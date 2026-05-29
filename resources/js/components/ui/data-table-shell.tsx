import type { ReactNode } from 'react';

type Props = {
    title: string;
    subtitle?: string;
    children: ReactNode;
};

export function DataTableShell({ title, subtitle, children }: Props) {
    return (
        <section className="album-paper overflow-hidden">
            <div className="border-b border-border bg-card px-4 py-3">
                <p className="text-sm font-semibold text-foreground">{title}</p>
                {subtitle ? <p className="mt-1 text-xs leading-relaxed text-dim">{subtitle}</p> : null}
            </div>
            <div className="overflow-x-auto">{children}</div>
        </section>
    );
}
