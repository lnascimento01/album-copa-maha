import { MonitorCog, Moon, Sun } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';
import type { Appearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

const options: Array<{ value: Appearance; label: string; icon: typeof Sun }> = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Escuro', icon: Moon },
    { value: 'system', label: 'Sistema', icon: MonitorCog },
];

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <div className={cn('inline-flex items-center gap-1 rounded-md border border-border bg-card p-1', compact && 'p-0.5')}>
            {options.map((option) => {
                const Icon = option.icon;
                const active = appearance === option.value;

                return (
                    <button
                        key={option.value}
                        type="button"
                        aria-label={`Tema ${option.label}`}
                        title={`Tema ${option.label}`}
                        onClick={() => updateAppearance(option.value)}
                        className={cn(
                            'inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-medium transition-colors',
                            active
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                        )}
                    >
                        <Icon className="size-3.5" />
                        {!compact ? <span>{option.label}</span> : null}
                    </button>
                );
            })}
        </div>
    );
}
