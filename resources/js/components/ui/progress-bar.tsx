type Props = {
    value: number;
    label?: string;
};

function clamp(value: number): number {
    return Math.max(0, Math.min(100, value));
}

export function ProgressBar({ value, label }: Props) {
    const safeValue = clamp(value);

    return (
        <div className="space-y-1">
            {label ? <div className="text-xs text-zinc-600">{label}</div> : null}
            <div className="h-2 rounded-sm bg-zinc-200">
                <div className="h-2 rounded-sm bg-zinc-900 transition-all" style={{ width: `${safeValue}%` }} />
            </div>
        </div>
    );
}
