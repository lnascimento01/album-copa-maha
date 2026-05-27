export default function AuthCardPreview() {
    return (
        <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 12 }).map((_, index) => {
                const isUnlocked = index < 5;

                return (
                    <div
                        key={`slot-${index}`}
                        className={`aspect-[3/4] border p-1 ${
                            isUnlocked
                                ? 'border-neutral-950 bg-neutral-100'
                                : 'border-neutral-400 bg-neutral-300/35'
                        }`}
                    >
                        <div className="flex h-full items-center justify-center border border-dashed border-neutral-500 text-[10px] font-medium uppercase tracking-wide text-neutral-700">
                            {isUnlocked ? `M${index + 1}` : 'LOCK'}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
