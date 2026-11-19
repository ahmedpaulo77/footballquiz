import { describe, expect, it } from 'vitest';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pageMeta, pageUrl, SITE } from '../../../scripts/generate-sitemap.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const appDir = path.join(repoRoot, 'app');
const sitemapPath = path.join(appDir, 'public', 'sitemap.xml');

async function htmlPages() {
  const files = await readdir(appDir);
  return files.filter((file) => file.endsWith('.html')).sort();
}

async function sitemapUrls() {
  const xml = await readFile(sitemapPath, 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

describe('السايت ماب (Sitemap)', () => {
  it('فيه كل صفحات app/*.html', async () => {
    const pages = await htmlPages();
    const expected = pages.map(pageUrl).sort();
    const actual = (await sitemapUrls()).sort();

    expect(actual).toEqual(expected);
  });

  it('الرئيسية بتطلع على الدومين من غير index.html', async () => {
    const urls = await sitemapUrls();

    expect(urls).toContain(`${SITE}/`);
    expect(urls.some((url) => url.endsWith('/index.html'))).toBe(false);
  });

  it('كل الروابط على الدومين الرسمي', async () => {
    const urls = await sitemapUrls();

    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) {
      expect(url.startsWith(`${SITE}/`)).toBe(true);
    }
  });

  it('مفيش أي رابط فيه .html (الهوست بيحوّلها لنسخة نظيفة)', async () => {
    const urls = await sitemapUrls();

    for (const url of urls) {
      expect(url.endsWith('.html'), url).toBe(false);
    }
  });

  it('canonical و og:url في كل صفحة بيشاوروا على الرابط النظيف', async () => {
    const pages = await htmlPages();

    for (const page of pages) {
      const html = await readFile(path.join(appDir, page), 'utf8');
      const expected = pageUrl(page);

      const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
      const ogUrl = html.match(/<meta property="og:url" content="([^"]+)"/);

      expect(canonical?.[1], `${page} canonical`).toBe(expected);
      expect(ogUrl?.[1], `${page} og:url`).toBe(expected);
    }
  });

  it('الرئيسية أعلى priority والألعاب قبل الأدلة', () => {
    expect(pageMeta('index.html').priority).toBe('1.0');
    expect(pageMeta('risk.html').priority).toBe('0.8');
    expect(pageMeta('guides.html').priority).toBe('0.9');
    expect(pageMeta('guide-risk.html').priority).toBe('0.7');
    expect(pageMeta('privacy.html').priority).toBe('0.4');

    expect(pageMeta('index.html').group).toBeLessThan(pageMeta('risk.html').group);
    expect(pageMeta('risk.html').group).toBeLessThan(pageMeta('guides.html').group);
    expect(pageMeta('guides.html').group).toBeLessThan(pageMeta('about.html').group);
  });
});
