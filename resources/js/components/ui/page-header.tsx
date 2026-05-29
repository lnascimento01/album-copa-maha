import type { ReactNode } from 'react';

type Props = {
    title: string;
    subtitle?: string | null;
    actions?: ReactNode;
};

export function PageHeader({ title, subtitle, actions }: Props) {
    return (
        <header className="brand-title-strip flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
                <p className="inline-flex w-fit items-center rounded-full border border-[color:var(--primary-200)] bg-[color:var(--primary-50)] px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-[color:var(--primary-600)] uppercase">Temporada Copa AAPH</p>
                <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{title}</h1>
                {subtitle ? <p className="max-w-3xl text-sm leading-relaxed text-dim">{subtitle}</p> : null}
            </div>
            {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </header>
    );
}
