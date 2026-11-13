import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// `--mode static`: backend-free build for hosting as plain files (fonts from Google Fonts, relative paths).
export default defineConfig(({ mode }) => {
  const isStatic = mode === 'static';
  return {
    plugins: [react()],
    base: isStatic ? './' : '/',
    resolve: isStatic ? {
      alias: [{ find: /^@fontsource\/gothic-a1\/\d+\.css$/, replacement: fileURLToPath(new URL('./src/empty.css', import.meta.url)) }],
    } : undefined,
    build: isStatic ? { outDir: 'dist-static', rollupOptions: { output: { inlineDynamicImports: true } } } : undefined,
    server: {
      port: 5173,
      proxy: { '/api': 'http://localhost:3000' },
    },
  };
});
