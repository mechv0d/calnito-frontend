import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig(function (_a) {
    var command = _a.command;
    return ({
        plugins: [
            react(),
            {
                name: 'calnito-favicon',
                transformIndexHtml: function () {
                    return [
                        {
                            tag: 'link',
                            attrs: {
                                rel: 'icon',
                                type: 'image/svg+xml',
                                href: command === 'serve' ? '/favicon-dev.svg' : '/favicon-prod.svg',
                            },
                            injectTo: 'head',
                        },
                    ];
                },
            },
        ],
        server: {
            port: 5173,
            strictPort: true,
        },
        preview: {
            port: 4173,
            strictPort: true,
        },
        test: {
            environment: 'jsdom',
            setupFiles: ['./src/test/setup.ts'],
            globals: true,
        },
    });
});
