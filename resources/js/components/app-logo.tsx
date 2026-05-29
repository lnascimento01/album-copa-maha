import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-9 items-center justify-center overflow-hidden rounded-full border border-sidebar-border bg-card shadow-sm">
                <AppLogoIcon className="size-8" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    Álbum da Copa AAPH
                </span>
                <span className="truncate text-[10px] font-medium tracking-[0.11em] text-dim uppercase">
                    Temporada de Coleção
                </span>
            </div>
        </>
    );
}
