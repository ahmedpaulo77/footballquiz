/**
 * بيولّد app/public/sitemap.xml أوتوماتيك من صفحات app/*.html.
 *
 * ليه؟ الصفحات كانت بتتضاف يدوي في السايت ماب، وأي صفحة جديدة ممكن تتنسى.
 * دلوقتي أي ملف .html في مجلد app بيتحط لوحده مع priority و changefreq مناسبين.
 *
 * الاستخدام: npm run sitemap   (وبيشتغل تلقائي قبل npm run build)
 */
import { readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const SITE = 'https://elkwayra.com';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const appDir = path.join(repoRoot, 'app');
const outputPath = path.join(appDir, 'public', 'sitemap.xml');

/** ألعاب الموقع بترتيب ظهورها في الرئيسية. */
const QUIZ_PAGES = [
  'who-am-i',
  'paths',
  'risk',
  'one-question',
  'top-three',
  'lineups',
  'cards',
];

/**
 * بيرجع بيانات السيو لكل صفحة: الترتيب، الـ priority، والـ changefreq.
 */
export function pageMeta(fileName) {
  const name = fileName.replace(/\.html$/, '');

  if (name === 'index') {
    return { group: 0, priority: '1.0', changefreq: 'weekly' };
  }

  const quizIndex = QUIZ_PAGES.indexOf(name);
  if (quizIndex !== -1) {
    return { group: 1 + quizIndex, priority: '0.8', changefreq: 'weekly' };
  }

  if (name === 'guides') {
    return { group: 20, priority: '0.9', changefreq: 'monthly' };
  }

  if (name.startsWith('guide-')) {
    return { group: 21, priority: '0.7', changefreq: 'monthly' };
  }

  if (name === 'about') {
    return { group: 30, priority: '0.5', changefreq: 'monthly' };
  }

  if (name === 'privacy') {
    return { group: 31, priority: '0.4', changefreq: 'yearly' };
  }

  return { group: 40, priority: '0.6', changefreq: 'monthly' };
}

/** الرابط العام للصفحة — الرئيسية بتطلع بدون index.html. */
export function pageUrl(fileName) {
  return fileName === 'index.html' ? `${SITE}/` : `${SITE}/${fileName}`;
}

// الصيغة المتفق عليها لآخر تعديل: YYYY-MM-DD
function toDate(value) {
  return value.toISOString().slice(0, 10);
}

async function buildSitemap() {
  const files = (await readdir(appDir))
    .filter((file) => file.endsWith('.html'))
    .filter((file) => !file.startsWith('.'));

  const pages = await Promise.all(
    files.map(async (file) => {
      const info = await stat(path.join(appDir, file));
      const meta = pageMeta(file);
      return {
        file,
        url: pageUrl(file),
        lastmod: toDate(info.mtime),
        ...meta,
      };
    })
  );

  pages.sort((a, b) => a.group - b.group || a.file.localeCompare(b.file));

  const body = pages
    .map(
      (page) => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

  await writeFile(outputPath, xml, 'utf8');

  console.log(`✔ sitemap.xml — ${pages.length} صفحة`);
  for (const page of pages) console.log(`  · ${page.url}`);
}

const isMain =
  process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isMain) {
  buildSitemap().catch((error) => {
    console.error('✖ فشل توليد السايت ماب:', error.message);
    process.exit(1);
  });
}
