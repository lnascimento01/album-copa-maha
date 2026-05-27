import type { ReactNode } from 'react';

type Props = {
    label: string;
    value: ReactNode;
    hint?: ReactNode;
    accent?: 'default' | 'success' | 'warning';
};

const accentStyles: Record<NonNullable<Props['accent']>, string> = {
    default: 'border-zinc-200 bg-white',
    success: 'border-emerald-200 bg-emerald-50/50',
    warning: 'border-amber-200 bg-amber-50/60',
};

export function MetricCard({ label, value, hint, accent = 'default' }: Props) {
    return (
        <section className={`rounded-md border p-4 ${accentStyles[accent]}`}>
            <p className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold leading-none text-zinc-950">{value}</p>
            {hint ? <div className="mt-2 text-xs text-zinc-600">{hint}</div> : null}
        </section>
    );
}
