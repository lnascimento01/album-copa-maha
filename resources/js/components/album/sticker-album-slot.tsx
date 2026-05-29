import { Link } from '@inertiajs/react';

type Props = {
    id?: number;
    code?: string;
    title?: string;
    rarity?: string;
    imageUrl?: string | null;
    unlocked?: boolean;
    subtitle?: string | null;
    teamShort?: string | null;
    empty?: boolean;
};

export function StickerAlbumSlot({ id, code, title, rarity, imageUrl, unlocked, teamShort, empty = false }: Props) {
    if (empty) {
        return (
            <div className="album-slot album-slot-empty" aria-hidden="true">
                <div className="album-slot__figure album-sticker-frame">
                    <div className="album-slot__placeholder">
                        <span className="album-slot__code-pill">---</span>
                        <span className="album-slot__placeholder-label">Espaço de figurinha</span>
                    </div>
                </div>
                <div className="album-slot__meta album-slot-meta">
                    <p className="album-slot__code">---</p>
                    <p className="album-slot__title">Slot bloqueado</p>
                    <div className="album-slot__footer">
                        <span className="album-slot__rarity">---</span>
                        <span className="album-slot__state is-locked">Bloqueada</span>
                    </div>
                </div>
            </div>
        );
    }

    const slotCode = code ?? '---';
    const slotTitle = title ?? 'Figurinha';
    const slotRarity = rarity ?? 'common';
    const isUnlocked = Boolean(unlocked);

    return (
        <Link
            href={`/album/stickers/${id ?? ''}`}
            className={`album-slot group block transition hover:-translate-y-0.5 motion-reduce:transform-none ${isUnlocked ? 'album-slot-unlocked' : 'album-slot-locked'}`}
        >
            <div className="album-slot__figure album-sticker-frame">
                {isUnlocked && imageUrl ? (
                    <img src={imageUrl} alt={slotTitle} className="album-slot__image album-sticker-image" />
                ) : (
                    <div className="album-slot__placeholder">
                        <span className="album-slot__code-pill">{slotCode}</span>
                        <span className="album-slot__placeholder-label">Espaço de figurinha</span>
                    </div>
                )}
                {teamShort ? (
                    <span className="album-slot__team-badge">
                        {teamShort}
                    </span>
                ) : null}
            </div>

            <div className="album-slot__meta album-slot-meta">
                <p className="album-slot__code">{slotCode}</p>
                <p className="album-slot__title">{slotTitle}</p>
                <div className="album-slot__footer">
                    <span className="album-slot__rarity">{slotRarity}</span>
                    <span className={`album-slot__state ${isUnlocked ? 'is-unlocked' : 'is-locked'}`}>{isUnlocked ? 'Coletada' : 'Bloqueada'}</span>
                </div>
            </div>
        </Link>
    );
}
