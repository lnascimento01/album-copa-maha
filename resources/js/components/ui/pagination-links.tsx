import { Link } from '@inertiajs/react';

type PaginationLink = { url: string | null; label: string; active: boolean };

type Props = {
    links: PaginationLink[];
    preserveState?: boolean;
    className?: string;
};

export function PaginationLinks({ links, preserveState = false, className = 'flex flex-wrap gap-2' }: Props) {
    return (
        <div className={className}>
            {links.map((link, index) =>
                link.url ? (
                    <Link
                        key={`${link.label}-${index}`}
                        href={link.url}
                        preserveState={preserveState}
                        className={`cursor-pointer rounded-sm border px-2 py-1 text-xs ${link.active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-foreground'}`}
                    >
                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                    </Link>
                ) : (
                    <span
                        key={`${link.label}-${index}`}
                        className="rounded-sm border border-border bg-card px-2 py-1 text-xs text-dim opacity-40"
                    >
                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                    </span>
                ),
            )}
        </div>
    );
}
