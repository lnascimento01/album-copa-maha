import { Link } from '@inertiajs/react';
import { logout } from '@/routes';

type Props = {
    description: string;
    badge: string;
    reason?: string | null;
};

export default function AuthStatusPage({ description, badge, reason }: Props) {
    return (
        <div className="space-y-4">
            <div className="inline-flex border border-neutral-900 px-2 py-1 text-xs font-semibold tracking-[0.12em] uppercase">
                {badge}
            </div>

            <p className="text-sm leading-relaxed text-neutral-700">{description}</p>

            {reason ? (
                <div className="border border-neutral-300 bg-neutral-100 p-3 text-sm text-neutral-700">
                    <p className="text-xs font-semibold tracking-wide uppercase">Motivo informado</p>
                    <p className="mt-1">{reason}</p>
                </div>
            ) : null}

            <p className="text-sm text-neutral-700">
                Caso precise de suporte, entre em contato com a administração.
            </p>

            <Link
                href={logout()}
                as="button"
                className="inline-flex w-full justify-center border border-neutral-900 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700"
            >
                Sair da conta
            </Link>
        </div>
    );
}
