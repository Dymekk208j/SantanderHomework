import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@services': fileURLToPath(new URL('./src/services', import.meta.url)),
			'@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
			'@errors': fileURLToPath(new URL('./src/errors', import.meta.url)),
			'@app-types': fileURLToPath(new URL('./src/types', import.meta.url)),
			'@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
			'@components': fileURLToPath(new URL('./src/components', import.meta.url)),
			'@constants': fileURLToPath(new URL('./src/constants', import.meta.url)),
		},
	},
	test: {
		globals: true,
		environment: 'happy-dom',
		include: ['src/**/__tests__/**/*.test.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'lcov'],
			include: ['src/**/*.{ts,tsx}'],
			exclude: ['src/**/*.d.ts', 'src/main.tsx', 'src/vite-env.d.ts', 'src/**/__tests__/**'],
		},
	},
});
