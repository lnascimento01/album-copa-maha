import type { ReactNode } from 'react';

type Props = {
    title: string;
    subtitle?: string;
    children: ReactNode;
};

export function DataTableShell({ title, subtitle, children }: Props) {
    return (
        <section className="rounded-md border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-medium text-foreground">{title}</p>
                {subtitle ? <p className="text-xs text-dim">{subtitle}</p> : null}
            </div>
            <div className="overflow-x-auto">{children}</div>
        </section>
    );
}
