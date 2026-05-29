import { Badge } from '@/components/ui/badge';

type Props = {
    source: string;
    label?: string;
};

function sourceStyle(source: string): string {
    switch (source) {
        case 'checkin':
            return 'border-sky-500/35 bg-sky-500/15 text-sky-700 dark:text-sky-300';
        case 'event_geolocation':
            return 'border-emerald-500/35 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300';
        case 'reward_code':
            return 'border-violet-500/35 bg-violet-500/15 text-violet-700 dark:text-violet-300';
        case 'social_mission':
            return 'border-amber-500/35 bg-amber-500/15 text-amber-700 dark:text-amber-300';
        case 'manual':
        case 'admin':
            return 'border-border bg-muted text-muted-foreground';
        default:
            return 'border-border bg-card text-foreground';
    }
}

export function OriginBadge({ source, label }: Props) {
    return (
        <Badge variant="outline" className={`rounded-sm text-[11px] uppercase tracking-wide ${sourceStyle(source)}`}>
            {label ?? source.replace(/_/g, ' ')}
        </Badge>
    );
}
