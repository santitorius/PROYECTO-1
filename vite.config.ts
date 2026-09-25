import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build`        → dist/        (estático, publicable en Vercel/Netlify/Cloudflare Pages)
// `npm run build:single` → dist-single/ (un único index.html autocontenido, abre sin internet)
export default defineConfig(({ mode }) => {
  const single = mode === 'single';
  return {
    base: './',
    plugins: single ? [viteSingleFile({ removeViteModuleLoader: true })] : [],
    build: {
      outDir: single ? 'dist-single' : 'dist',
      assetsInlineLimit: single ? 100_000_000 : 4096,
      cssCodeSplit: !single,
      target: 'es2020',
      chunkSizeWarningLimit: 1500,
    },
  };
});
