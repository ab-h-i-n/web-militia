import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // Serve the repo-root /assets directory as the public dir so we don't
  // duplicate raw assets. Files there are served from `/`.
  // e.g. /assets/images/loading_screen.png  →  url: /images/loading_screen.png
  publicDir: resolve(__dirname, '../../assets'),
  server: {
    port: 5173,
    host: true,
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
});
