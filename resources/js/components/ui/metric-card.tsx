import type { ReactNode } from 'react';

type Props = {
    label: string;
    value: ReactNode;
    hint?: ReactNode;
    accent?: 'default' | 'success' | 'warning';
};

const accentStyles: Record<NonNullable<Props['accent']>, string> = {
    default: 'border-border bg-card',
    success: 'border-emerald-500/30 bg-emerald-500/10',
    warning: 'border-amber-500/30 bg-amber-500/10',
};

export function MetricCard({ label, value, hint, accent = 'default' }: Props) {
    return (
        <section className={`rounded-md border p-4 ${accentStyles[accent]}`}>
            <p className="text-[11px] uppercase tracking-wide text-dim">{label}</p>
            <p className="mt-2 text-2xl font-semibold leading-none text-foreground">{value}</p>
            {hint ? <div className="mt-2 text-xs text-dim">{hint}</div> : null}
        </section>
    );
}
