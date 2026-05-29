import { Link } from '@inertiajs/react';
import { logout } from '@/routes';

type Props = {
    description: string;
    badge: string;
    reason?: string | null;
    extraInfo?: string | null;
};

export default function AuthStatusPage({ description, badge, reason, extraInfo }: Props) {
    return (
        <div className="space-y-4">
            <div className="brand-pill">
                {badge}
            </div>

            <p className="text-sm leading-relaxed text-dim">{description}</p>

            {reason ? (
                <div className="rounded-md border border-border bg-muted p-3 text-sm text-foreground">
                    <p className="text-xs font-semibold tracking-wide uppercase text-dim">Motivo informado</p>
                    <p className="mt-1">{reason}</p>
                </div>
            ) : null}

            <p className="text-sm text-dim">
                Caso precise de suporte, entre em contato com a administração.
            </p>

            {extraInfo ? <p className="text-xs text-dim">{extraInfo}</p> : null}

            <Link
                href={logout()}
                as="button"
                className="inline-flex w-full justify-center rounded-sm border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-95"
            >
                Sair da conta
            </Link>
        </div>
    );
}
