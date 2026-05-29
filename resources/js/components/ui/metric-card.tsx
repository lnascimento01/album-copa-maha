import type { ReactNode } from 'react';

type Props = {
    label: string;
    value: ReactNode;
    hint?: ReactNode;
    accent?: 'default' | 'success' | 'warning';
};

const accentStyles: Record<NonNullable<Props['accent']>, string> = {
    default: 'border-border bg-card',
    success: 'border-[color:var(--secondary-200)] bg-[color:var(--surface-success)]',
    warning: 'border-[color:var(--warning)]/35 bg-[color:var(--surface-warning)]',
};

export function MetricCard({ label, value, hint, accent = 'default' }: Props) {
    return (
        <section className={`rounded-md border p-4 shadow-[var(--shadow-sm)] ${accentStyles[accent]}`}>
            <p className="text-[11px] font-semibold tracking-[0.12em] text-dim uppercase">{label}</p>
            <p className="mt-2 text-2xl font-semibold leading-none text-foreground sm:text-[1.7rem]">{value}</p>
            {hint ? <div className="mt-2 text-xs text-dim">{hint}</div> : null}
        </section>
    );
}
