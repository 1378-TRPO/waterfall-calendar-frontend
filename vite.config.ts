import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api': { target: 'http://localhost:5067', changeOrigin: true },
        },
    },
    build: {
        // Кэш TanStack Query меняется независимо от приложения, поэтому
        // выносим его в отдельный чанк, чтобы не инвалидировать весь бандл.
        rolldownOptions: {
            output: {
                codeSplitting: {
                    // minSize/minShareCount по умолчанию склеивают мелкие
                    // группы обратно в общий vendor, отключаем это.
                    minSize: 0,
                    minShareCount: 1,
                    groups: [
                        {
                            name: 'react',
                            test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
                            priority: 20,
                        },
                        { name: 'query', test: /node_modules[\\/]@tanstack[\\/]/, priority: 20 },
                        { name: 'vendor', test: /node_modules[\\/]/, priority: 10 },
                    ],
                },
            },
        },
    },
});
