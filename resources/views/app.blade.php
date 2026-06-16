@php
    $designTheme = config('app.design_theme', 'auto');
    if ($designTheme === 'auto') {
        $designTheme = (request()->is('admin') || request()->is('admin/*')) ? 'linear' : 'spotify';
    }
    $forceDark = in_array($designTheme, ['spotify', 'linear']);
    $initBg = match($designTheme) {
        'spotify' => '#121212',
        'linear'  => '#0f0e13',
        default   => '#f6f8f2',
    };
    $initBgDark = match($designTheme) {
        'spotify' => '#121212',
        'linear'  => '#0f0e13',
        default   => '#07111f',
    };
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}"
      data-design="{{ $designTheme }}"
      @class(['dark' => ($appearance ?? 'system') == 'dark' || $forceDark])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <script>
            (function () {
                var serverAppearance = '{{ $appearance ?? "system" }}';
                var forceDark = {{ $forceDark ? 'true' : 'false' }};
                var storedAppearance = window.localStorage.getItem('appearance') || serverAppearance;
                var useDark = forceDark
                    || storedAppearance === 'dark'
                    || (storedAppearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

                if (useDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                }
            })();
        </script>

        <style>
            html {
                background-color: {{ $initBg }};
            }

            html.dark {
                background-color: {{ $initBgDark }};
            }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx'])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
