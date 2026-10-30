/**
 * بينشر النسخة المبنية (dist) في جذر الريبو.
 *
 * ليه؟ GitHub Pages عندنا مضبوط على «Deploy from a branch → main / (root)»،
 * فالمتصفح بيقرأ index.html اللي في الجذر. لو خدنا الكود المصدري زي ما هو
 * (JSX) الصفحة بتطلع بيضا، عشان كده بنحط الملفات المبنية في الجذر.
 *
 * الاستخدام: npm run pages
 */
import { access, cp, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const distDir = path.join(repoRoot, 'dist');

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

if (!(await exists(distDir))) {
  console.error('✖ مفيش مجلد dist — شغّل npm run build الأول.');
  process.exit(1);
}

const entries = await readdir(distDir, { withFileTypes: true });

for (const entry of entries) {
  const source = path.join(distDir, entry.name);
  const target = path.join(repoRoot, entry.name);

  // بنشيل النسخة القديمة الأول عشان مايفضلش ملفات assets قديمة
  await rm(target, { recursive: true, force: true });
  await cp(source, target, { recursive: true });
  console.log(`✔ ${entry.name}${entry.isDirectory() ? '/' : ''}`);
}

// GitHub Pages بيعمل معالجة Jekyll افتراضيًا — الملف ده بيلغيها
await writeFile(path.join(repoRoot, '.nojekyll'), '');

console.log('\n✔ النسخة المبنية بقت في جذر الريبو — ارفعها بـ git push');
