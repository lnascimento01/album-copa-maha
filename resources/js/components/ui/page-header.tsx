import type { ReactNode } from 'react';

type Props = {
    title: string;
    subtitle?: string | null;
    actions?: ReactNode;
};

export function PageHeader({ title, subtitle, actions }: Props) {
    return (
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
                <h1 className="text-xl font-semibold tracking-tight text-zinc-950">{title}</h1>
                {subtitle ? <p className="text-sm text-zinc-600">{subtitle}</p> : null}
            </div>
            {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </header>
    );
}
