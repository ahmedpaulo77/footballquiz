import { useState } from 'react';
import { getUi } from '../lib/i18n.js';
import { getQuizzes } from '../lib/quizzes.js';
import { SITE_PAGES, DEVELOPER_PORTFOLIO } from '../lib/sitePages.js';
import { loadLang, loadTheme, saveLang, saveTheme } from '../lib/storage.js';

/** روابط كل لعبة */
const QUIZ_URLS = {
  'who-am-i': './who-am-i.html',
  paths: './paths.html',
  risk: './risk.html',
  'one-question': './one-question.html',
  'top-three': './top-three.html',
  lineups: './lineups.html',
  cards: './cards.html',
};

/** لون كل لعبة */
const QUIZ_COLORS = {
  'who-am-i': { from: 'rgba(139,92,246,0.22)', to: 'rgba(109,40,217,0.08)' },
  paths: { from: 'rgba(34,211,238,0.22)', to: 'rgba(8,145,178,0.08)' },
  risk: { from: 'rgba(251,191,36,0.22)', to: 'rgba(217,159,0,0.08)' },
  'one-question': { from: 'rgba(52,211,153,0.22)', to: 'rgba(4,120,87,0.08)' },
  'top-three': { from: 'rgba(251,113,133,0.22)', to: 'rgba(190,18,60,0.08)' },
  lineups: { from: 'rgba(139,92,246,0.22)', to: 'rgba(34,211,238,0.08)' },
  cards: { from: 'rgba(251,146,60,0.22)', to: 'rgba(234,88,12,0.08)' },
};

/** وصف مختصر لكل لعبة */
const QUIZ_DESC = {
  ar: {
    'who-am-i': 'تلميحات عن لاعب — اعرفه قبل ما التلميحات تخلص',
    paths: 'مسار أندية لاعب بالترتيب — مين صاحب المسار ده؟',
    risk: 'لوحة فئات ونقاط لفريقين — مع خلية دبل ×2',
    'one-question': 'وزّع الـ١٠ نقط على الإجابات — اللي تاجر يكسب',
    'top-three': 'اختار ٣ لاعبين صح من ٩ — واكسب البونص',
    lineups: 'خمّن لاعبي المباريات المشهورة — نهائيات وكلاسيكيات',
    cards: 'خلص كروتك الأول — لعبة الكروت لفريقين',
  },
  en: {
    'who-am-i': 'Clues about a player — guess before they run out',
    paths: "A player's club path in order — whose is it?",
    risk: 'A category board for two teams — with a Double ×2 cell',
    'one-question': 'Spread your 10 points on the right answer — winner takes all',
    'top-three': 'Pick 3 correct names out of 9 — and earn the bonus',
    lineups: 'Guess the starters of famous matches — finals and classics',
    cards: 'Empty your hand first — the cards game',
  },
};

export default function HomePage() {
  const [lang, setLang] = useState(() => loadLang());
  const [theme, setTheme] = useState(() => loadTheme());

  const ui = getUi(lang);
  const quizzes = getQuizzes(lang);
  const isAr = lang === 'ar';

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    saveTheme(next);
    document.documentElement.dataset.theme = next;
  }

  function toggleLang() {
    const next = isAr ? 'en' : 'ar';
    setLang(next);
    saveLang(next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
  }

  return (
    <div className="app home-page" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="field-decor" aria-hidden="true" />

      {/* هيدر */}
      <header className="topbar">
        <div className="brand">
          <div className="brand-text">
            <h1>{ui.brand}</h1>
          </div>
        </div>
        <div className="topbar-actions">
          <button
            type="button"
            className="lang-btn"
            onClick={toggleLang}
            aria-label={ui.langAria}
          >
            {ui.langButton}
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? ui.themeToLight : ui.themeToDark}
          >
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path
                  d="M12 17a5 5 0 100-10 5 5 0 000 10zm0 3v2m0-22v2M4.2 4.2l1.4 1.4m12.8 12.8l1.4 1.4M2 12h2m18 0h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path d="M21 13.2A9 9 0 1110.8 3a7 7 0 1010.2 10.2z" fill="currentColor" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero-ball" aria-hidden="true">⚽</div>
        <h2 className="home-hero-title">
          {isAr ? 'ألعاب كورة للجميع' : 'Football Games for Everyone'}
        </h2>
        <p className="home-hero-sub">
          {isAr
            ? 'واحد حكم، فريقين يتنافسوا — اختار لعبتك وابدأ'
            : 'One host, two competing teams — pick your game and start'}
        </p>
      </section>

      {/* كروت الألعاب */}
      <main>
        <h2 className="home-section-title">
          {isAr ? 'الألعاب' : 'Games'}
        </h2>
        <div className="home-grid">
          {quizzes.map((quiz) => {
            const color = QUIZ_COLORS[quiz.id] ?? QUIZ_COLORS['who-am-i'];
            const desc = QUIZ_DESC[lang]?.[quiz.id] ?? '';
            const url = QUIZ_URLS[quiz.id] ?? './who-am-i.html';

            return (
              <a
                key={quiz.id}
                href={url}
                className="home-card"
                style={{
                  '--card-from': color.from,
                  '--card-to': color.to,
                }}
              >
                <div className="home-card-emoji" aria-hidden="true">
                  {quiz.emoji}
                </div>
                <div className="home-card-body">
                  <h3 className="home-card-title">{quiz.title}</h3>
                  <p className="home-card-desc">{desc}</p>
                </div>
                <div className="home-card-arrow" aria-hidden="true">
                  {isAr ? '←' : '→'}
                </div>
              </a>
            );
          })}
        </div>

        {/* تحديثات مستمرة */}
        <section
          className="home-updates"
          aria-label={isAr ? 'تحديثات المحتوى' : 'Content updates'}
        >
          <span className="home-updates-icon" aria-hidden="true">✨</span>
          <div>
            <strong>{isAr ? 'تحديثات مستمرة' : 'Always updating'}</strong>
            <p>
              {isAr
                ? 'بنضيف أسئلة ولاعبين وماتشات جديدة كل فترة — ارجع تاني هتلاقي حاجات جديدة.'
                : 'New questions, players and matches are added regularly — come back for more.'}
            </p>
          </div>
        </section>

        {/* روابط أدلة الألعاب — محتوى نصي وروابط داخلية */}
        <section className="home-guides">
          <h2 className="home-section-title">
            {isAr ? 'محتاج تعرف القواعد الأول؟' : 'Need the rules first?'}
          </h2>
          <p className="home-guides-lead">
            {isAr
              ? 'كل لعبة ليها صفحة شرح مستقلة: الفكرة، طريقة اللعب، حساب النقاط، ومثال عملي.'
              : 'Every game has its own guide: the idea, how to play, how points are scored, and a worked example.'}
          </p>
          <div className="home-guide-links">
            {quizzes.map((quiz) => (
              <a
                key={quiz.id}
                href={`./guide-${quiz.id}.html`}
                className="home-guide-link"
              >
                <span aria-hidden="true">{quiz.emoji}</span>
                {quiz.title}
              </a>
            ))}
          </div>
          <a className="home-guide-all" href="./guides.html">
            {isAr ? 'افتح دليل الألعاب كامل ←' : 'Open the full game guide →'}
          </a>
        </section>

        {/* قسم إزاي تلعب — مهم لـ AdSense */}
        <section className="home-howto">
          <h2 className="home-section-title">
            {isAr ? 'إزاي تلعب؟' : 'How to play?'}
          </h2>
          <div className="home-howto-steps">
            <div className="home-step">
              <span className="home-step-num">١</span>
              <div>
                <b>{isAr ? 'اختار لعبة' : 'Pick a game'}</b>
                <p>{isAr ? 'في كل لعبة أسلوب مختلف — جرب كلهم.' : 'Each game plays differently — try them all.'}</p>
              </div>
            </div>
            <div className="home-step">
              <span className="home-step-num">٢</span>
              <div>
                <b>{isAr ? 'واحد يبقى حكم' : 'One person hosts'}</b>
                <p>{isAr ? 'الحكم ماسك الموبايل بيقرأ السؤال بصوت عالي.' : 'The host holds the phone and reads the question out loud.'}</p>
              </div>
            </div>
            <div className="home-step">
              <span className="home-step-num">٣</span>
              <div>
                <b>{isAr ? 'الفريقين يتنافسوا' : 'Teams compete'}</b>
                <p>{isAr ? 'كل فريق يخمّن والحكم بيدي النقطة للصح.' : 'Each team guesses and the host awards points.'}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* فوتر */}
      <footer className="site-footer">
        <p>{ui.footerTitle}</p>
        <nav
          className="site-footer-links"
          aria-label={isAr ? 'روابط الموقع' : 'Site links'}
        >
          {SITE_PAGES.map((page) => (
            <a key={page.href} href={page.href} className="site-footer-link">
              {page[lang]}
            </a>
          ))}
        </nav>
        <p className="site-footer-portfolio">
          <a
            href={DEVELOPER_PORTFOLIO.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
              <path
                d="M14 4h6v6M20 4l-8 8M18 14v4a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {DEVELOPER_PORTFOLIO[lang]}
          </a>
        </p>
      </footer>
    </div>
  );
}
