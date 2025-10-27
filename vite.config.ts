import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 5173,
    proxy: {
      '/products': { target: 'https://eshop-api-m8qr.onrender.com', changeOrigin: true, secure: false },
      '/cart': { target: 'https://eshop-api-m8qr.onrender.com', changeOrigin: true, secure: false },
      '/checkout': { target: 'https://eshop-api-m8qr.onrender.com', changeOrigin: true, secure: false },
    },
  },
  build: { outDir: 'dist' },
});
