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
    | 'inactive'
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
    if (['inactive', 'disabled'].includes(normalized)) return 'inactive';

    return 'default';
}

const classes: Record<Variant, string> = {
    pending: 'border-[color:var(--warning)]/35 bg-[color:var(--warning-bg)] text-[color:#92400e]',
    approved: 'border-[color:var(--secondary-200)] bg-[color:var(--secondary-100)] text-[color:var(--secondary-900)]',
    rejected: 'border-[color:#f9c7c2] bg-[color:var(--danger-bg)] text-[color:var(--danger)]',
    suspended: 'border-border bg-muted text-muted-foreground',
    active: 'border-[color:var(--primary-200)] bg-[color:var(--primary-50)] text-[color:var(--primary-700)]',
    opened: 'border-[color:var(--secondary-200)] bg-[color:var(--secondary-100)] text-[color:var(--secondary-900)]',
    cancelled: 'border-border bg-muted text-muted-foreground',
    draft: 'border-border bg-muted text-muted-foreground',
    closed: 'border-border bg-muted text-muted-foreground',
    archived: 'border-border bg-muted text-muted-foreground',
    revoked: 'border-[color:#f9c7c2] bg-[color:var(--danger-bg)] text-[color:var(--danger)]',
    inactive: 'border-border bg-muted text-muted-foreground',
    default: 'border-border bg-card text-foreground',
};

const ptBrLabels: Record<Variant, string> = {
    pending:   'Pendente',
    approved:  'Aprovado',
    rejected:  'Rejeitado',
    suspended: 'Suspenso',
    active:    'Ativo',
    opened:    'Aberto',
    cancelled: 'Cancelado',
    draft:     'Rascunho',
    closed:    'Fechado',
    archived:  'Arquivado',
    revoked:   'Revogado',
    inactive:  'Inativo',
    default:   '',
};

export function StatusBadge({ value, label }: Props) {
    const variant = resolveVariant(value);
    const displayLabel = label ?? ptBrLabels[variant] || value;

    return (
        <Badge variant="outline" className={`rounded-sm px-2 py-0.5 text-[11px] font-semibold tracking-[0.1em] uppercase ${classes[variant]}`}>
            {displayLabel}
        </Badge>
    );
}
