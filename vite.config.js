import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // مسارات نسبية عشان تشتغل على GitHub Pages من غير ما نحدد اسم الريبو
  base: './',
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
  },
  test: {
    environment: 'node',
    globals: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
