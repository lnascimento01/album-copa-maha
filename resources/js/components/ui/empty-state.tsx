import type { ReactNode } from 'react';

type Props = {
    title: string;
    description?: string;
    action?: ReactNode;
};

export function EmptyState({ title, description, action }: Props) {
    return (
        <div className="rounded-md border border-dashed border-border bg-muted/60 p-6 text-center">
            <p className="text-sm font-medium text-foreground">{title}</p>
            {description ? <p className="mt-1 text-sm text-dim">{description}</p> : null}
            {action ? <div className="mt-3">{action}</div> : null}
        </div>
    );
}
