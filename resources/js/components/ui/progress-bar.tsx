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
            {label ? <div className="text-xs text-dim">{label}</div> : null}
            <div className="h-2 rounded-sm bg-muted">
                <div className="h-2 rounded-sm bg-primary transition-all" style={{ width: `${safeValue}%` }} />
            </div>
        </div>
    );
}
