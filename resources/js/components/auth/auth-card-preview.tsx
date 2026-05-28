export default function AuthCardPreview() {
    return (
        <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 12 }).map((_, index) => {
                const isUnlocked = index < 5;

                return (
                    <div
                        key={`slot-${index}`}
                        className={`aspect-[3/4] rounded-sm border p-1 ${
                            isUnlocked
                                ? 'border-primary/30 bg-accent/45'
                                : 'border-border bg-muted'
                        }`}
                    >
                        <div className="flex h-full items-center justify-center rounded-[4px] border border-dashed border-border text-[10px] font-medium tracking-wide text-dim uppercase">
                            {isUnlocked ? `M${index + 1}` : 'LOCK'}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
