
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    open: true,
    proxy: {
      '/api': {
        target: 'http://mgf.vortex-tech.tech',
        changeOrigin: true,
        secure: false,  // only if the remote serves plain http
      },
    },
  },

});