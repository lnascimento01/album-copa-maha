import AuthCardPreview from '@/components/auth/auth-card-preview';

export default function AuthBrandPanel() {
    return (
        <aside className="hidden border-r border-neutral-800/20 bg-neutral-100 p-8 lg:flex lg:flex-col lg:justify-between">
            <div>
                <div className="inline-flex items-center border border-neutral-900 px-2 py-1 text-xs font-semibold tracking-[0.14em] uppercase">
                    Temporada MAHA 2026
                </div>
                <h2 className="mt-5 text-3xl font-semibold leading-tight text-neutral-900">
                    Entre no álbum da temporada
                </h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-700">
                    Marque presença, abra pacotes e complete a coleção do time.
                </p>

                <div className="mt-8 border border-neutral-300 bg-white p-4">
                    <div className="mb-2 flex items-center justify-between text-xs uppercase text-neutral-600">
                        <span>Progresso de Coleção</span>
                        <span>5/12 slots</span>
                    </div>
                    <AuthCardPreview />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="border border-neutral-400 bg-white p-2">
                    <div className="font-semibold">Check-in</div>
                    <div className="mt-1 text-neutral-600">Presença diária</div>
                </div>
                <div className="border border-neutral-400 bg-white p-2">
                    <div className="font-semibold">Time</div>
                    <div className="mt-1 text-neutral-600">Jornada coletiva</div>
                </div>
                <div className="border border-neutral-400 bg-white p-2">
                    <div className="font-semibold">Coleção</div>
                    <div className="mt-1 text-neutral-600">Álbum em evolução</div>
                </div>
            </div>
        </aside>
    );
}
