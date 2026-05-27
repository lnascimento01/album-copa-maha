import { Badge } from '@/components/ui/badge';

type Props = {
    source: string;
    label?: string;
};

function sourceStyle(source: string): string {
    switch (source) {
        case 'checkin':
            return 'border-blue-300 bg-blue-50 text-blue-800';
        case 'reward_code':
            return 'border-violet-300 bg-violet-50 text-violet-800';
        case 'social_mission':
            return 'border-orange-300 bg-orange-50 text-orange-800';
        case 'manual':
        case 'admin':
            return 'border-zinc-300 bg-zinc-100 text-zinc-700';
        default:
            return 'border-zinc-300 bg-white text-zinc-700';
    }
}

export function OriginBadge({ source, label }: Props) {
    return (
        <Badge variant="outline" className={`rounded-sm text-[11px] uppercase tracking-wide ${sourceStyle(source)}`}>
            {label ?? source.replace(/_/g, ' ')}
        </Badge>
    );
}
