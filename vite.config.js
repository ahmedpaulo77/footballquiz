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
    rollupOptions: {
      input: {
        // الهوم بيدج — أول ما يخش يشوف كل الألعاب
        index: 'app/index.html',
        // كل لعبة ليها صفحة HTML مستقلة = إعلانات جديدة عند كل انتقال
        'who-am-i': 'app/who-am-i.html',
        paths: 'app/paths.html',
        risk: 'app/risk.html',
        'one-question': 'app/one-question.html',
        'top-three': 'app/top-three.html',
        lineups: 'app/lineups.html',
        cards: 'app/cards.html',
        // صفحات المحتوى النصي — مطلوبة لمراجعة AdSense والسيو
        guides: 'app/guides.html',
        'guide-who-am-i': 'app/guide-who-am-i.html',
        'guide-paths': 'app/guide-paths.html',
        'guide-risk': 'app/guide-risk.html',
        'guide-one-question': 'app/guide-one-question.html',
        'guide-top-three': 'app/guide-top-three.html',
        'guide-lineups': 'app/guide-lineups.html',
        'guide-cards': 'app/guide-cards.html',
        about: 'app/about.html',
        privacy: 'app/privacy.html',
      },
    },
  },
});
