import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) {
                        return;
                    }

                    if (id.includes('/react/') || id.includes('/react-dom/')) {
                        return 'vendor-react';
                    }

                    if (id.includes('/@inertiajs/')) {
                        return 'vendor-inertia';
                    }

                    if (id.includes('/@radix-ui/')) {
                        return 'vendor-radix';
                    }

                    if (id.includes('/lucide-react/')) {
                        return 'vendor-icons';
                    }

                    if (id.includes('/qrcode.react/')) {
                        return 'vendor-qrcode';
                    }

                    return 'vendor-misc';
                },
            },
        },
    },
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
            fonts: [
                bunny('Instrument Sans', {
                    weights: [400, 500, 600],
                }),
            ],
        }),
        inertia(),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        ...(command === 'serve'
            ? [
                  wayfinder({
                      formVariants: true,
                      command: 'php artisan wayfinder:generate --no-interaction',
                  }),
              ]
            : []),
    ],
}));
