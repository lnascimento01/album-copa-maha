export default function AuthCardPreview() {
    return (
        <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 12 }).map((_, index) => {
                const isUnlocked = index < 5;

                return (
                    <div
                        key={`slot-${index}`}
                        className={`aspect-[3/4] rounded-md border p-1 ${
                            isUnlocked
                                ? 'border-primary/45 bg-accent/65'
                                : 'border-border bg-muted/80'
                        }`}
                    >
                        <div className="flex h-full items-center justify-center rounded-[6px] border border-dashed border-border text-[10px] font-semibold tracking-[0.08em] text-dim uppercase">
                            {isUnlocked ? `AAPH-${index + 1}` : 'LOCK'}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
