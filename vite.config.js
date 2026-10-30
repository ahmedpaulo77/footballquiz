import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // كود المشروع في app/ — والملفات المبنية بتتنشر في جذر الريبو
  // عشان GitHub Pages (النشر من البرانش) يلاقي index.html جاهز.
  root: 'app',
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
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: false,
  },
});
