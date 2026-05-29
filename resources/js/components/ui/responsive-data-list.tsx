import type { ReactNode } from 'react';

type Props<T> = {
    items: T[];
    getKey: (item: T, index: number) => string | number;
    renderItem: (item: T) => ReactNode;
    empty: ReactNode;
};

export function ResponsiveDataList<T>({ items, getKey, renderItem, empty }: Props<T>) {
    if (items.length === 0) {
        return <div className="responsive-data-list">{empty}</div>;
    }

    return (
        <div className="responsive-data-list">
            {items.map((item, index) => (
                <article key={getKey(item, index)} className="responsive-data-item">
                    {renderItem(item)}
                </article>
            ))}
        </div>
    );
}
