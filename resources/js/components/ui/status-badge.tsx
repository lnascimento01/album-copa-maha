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
    pending: 'border-amber-300 bg-amber-50 text-amber-800',
    approved: 'border-emerald-300 bg-emerald-50 text-emerald-800',
    rejected: 'border-red-300 bg-red-50 text-red-800',
    suspended: 'border-zinc-400 bg-zinc-100 text-zinc-700',
    active: 'border-blue-300 bg-blue-50 text-blue-800',
    opened: 'border-blue-300 bg-blue-50 text-blue-800',
    cancelled: 'border-zinc-400 bg-zinc-100 text-zinc-700',
    draft: 'border-zinc-400 bg-zinc-100 text-zinc-700',
    closed: 'border-zinc-400 bg-zinc-100 text-zinc-700',
    archived: 'border-zinc-400 bg-zinc-100 text-zinc-700',
    revoked: 'border-red-300 bg-red-50 text-red-800',
    default: 'border-zinc-300 bg-white text-zinc-700',
};

export function StatusBadge({ value, label }: Props) {
    const variant = resolveVariant(value);

    return (
        <Badge variant="outline" className={`rounded-sm text-[11px] uppercase tracking-wide ${classes[variant]}`}>
            {label ?? value}
        </Badge>
    );
}
