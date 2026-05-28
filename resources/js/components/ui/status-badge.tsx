import { Badge } from '@/components/ui/badge';

type Variant =
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'suspended'
    | 'active'
    | 'opened'
    | 'cancelled'
    | 'draft'
    | 'closed'
    | 'archived'
    | 'revoked'
    | 'default';

type Props = {
    value: string;
    label?: string;
};

function resolveVariant(value: string): Variant {
    const normalized = value.toLowerCase();

    if (['pending'].includes(normalized)) return 'pending';
    if (['approved', 'open', 'confirmed'].includes(normalized)) return 'approved';
    if (['active'].includes(normalized)) return 'active';
    if (['opened'].includes(normalized)) return 'opened';
    if (['rejected'].includes(normalized)) return 'rejected';
    if (['suspended'].includes(normalized)) return 'suspended';
    if (['cancelled', 'canceled'].includes(normalized)) return 'cancelled';
    if (['draft'].includes(normalized)) return 'draft';
    if (['closed'].includes(normalized)) return 'closed';
    if (['archived'].includes(normalized)) return 'archived';
    if (['revoked', 'expired'].includes(normalized)) return 'revoked';

    return 'default';
}

const classes: Record<Variant, string> = {
    pending: 'border-amber-500/35 bg-amber-500/15 text-amber-700 dark:text-amber-300',
    approved: 'border-emerald-500/35 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    rejected: 'border-red-500/35 bg-red-500/15 text-red-700 dark:text-red-300',
    suspended: 'border-border bg-muted text-muted-foreground',
    active: 'border-sky-500/35 bg-sky-500/15 text-sky-700 dark:text-sky-300',
    opened: 'border-indigo-500/35 bg-indigo-500/15 text-indigo-700 dark:text-indigo-300',
    cancelled: 'border-border bg-muted text-muted-foreground',
    draft: 'border-border bg-muted text-muted-foreground',
    closed: 'border-border bg-muted text-muted-foreground',
    archived: 'border-border bg-muted text-muted-foreground',
    revoked: 'border-red-500/35 bg-red-500/15 text-red-700 dark:text-red-300',
    default: 'border-border bg-card text-foreground',
};

export function StatusBadge({ value, label }: Props) {
    const variant = resolveVariant(value);

    return (
        <Badge variant="outline" className={`rounded-sm text-[11px] uppercase tracking-wide ${classes[variant]}`}>
            {label ?? value}
        </Badge>
    );
}
