import AuthCardPreview from '@/components/auth/auth-card-preview';

export default function AuthBrandPanel() {
    return (
        <aside className="brand-hero hidden border-r border-border p-8 lg:flex lg:flex-col lg:justify-between">
            <div>
                <div className="brand-pill">
                    Álbum da Copa AAPH
                </div>
                <h2 className="mt-5 text-3xl font-semibold leading-tight text-foreground">
                    Uma copa para colecionar história do time
                </h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-dim">
                    O Álbum da Copa AAPH transforma presença em progresso de coleção. Entre, confirme participação e revele sua temporada figurinha por figurinha.
                </p>

                <div className="album-paper mt-8 p-4">
                    <div className="mb-2 flex items-center justify-between text-xs tracking-wide uppercase text-dim">
                        <span>Página da temporada</span>
                        <span>5/12 slots</span>
                    </div>
                    <AuthCardPreview />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="surface-card rounded-md p-2">
                    <div className="font-semibold text-foreground">Check-in</div>
                    <div className="mt-1 text-dim">Presença vira pacote</div>
                </div>
                <div className="surface-card rounded-md p-2">
                    <div className="font-semibold text-foreground">Time</div>
                    <div className="mt-1 text-dim">Energia coletiva</div>
                </div>
                <div className="surface-card rounded-md p-2">
                    <div className="font-semibold text-foreground">Coleção</div>
                    <div className="mt-1 text-dim">Álbum em evolução</div>
                </div>
            </div>
        </aside>
    );
}
