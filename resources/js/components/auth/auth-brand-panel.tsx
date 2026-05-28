import AuthCardPreview from '@/components/auth/auth-card-preview';

export default function AuthBrandPanel() {
    return (
        <aside className="brand-hero hidden border-r border-border p-8 lg:flex lg:flex-col lg:justify-between">
            <div>
                <div className="inline-flex items-center rounded-sm border border-primary/40 bg-card/70 px-2 py-1 text-xs font-semibold tracking-[0.14em] text-primary uppercase">
                    Temporada MAHA 2026
                </div>
                <h2 className="mt-5 text-3xl font-semibold leading-tight text-foreground">
                    Entre no álbum da temporada
                </h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-dim">
                    Marque presença, abra pacotes e complete a coleção do time.
                </p>

                <div className="surface-card mt-8 rounded-md p-4">
                    <div className="mb-2 flex items-center justify-between text-xs tracking-wide uppercase text-dim">
                        <span>Progresso de Coleção</span>
                        <span>5/12 slots</span>
                    </div>
                    <AuthCardPreview />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="surface-card rounded-md p-2">
                    <div className="font-semibold text-foreground">Check-in</div>
                    <div className="mt-1 text-dim">Presença diária</div>
                </div>
                <div className="surface-card rounded-md p-2">
                    <div className="font-semibold text-foreground">Time</div>
                    <div className="mt-1 text-dim">Jornada coletiva</div>
                </div>
                <div className="surface-card rounded-md p-2">
                    <div className="font-semibold text-foreground">Coleção</div>
                    <div className="mt-1 text-dim">Álbum em evolução</div>
                </div>
            </div>
        </aside>
    );
}
