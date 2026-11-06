const KEY_THEME = 'wlp:theme';
const KEY_HELP = 'wlp:help:seen';
const KEY_QUIZ = 'wlp:quiz';
const KEY_LANG = 'wlp:lang';
const KEY_TEAMS = 'wlp:teams';
const KEY_TEAMS_SEEN = 'wlp:teams:seen';
const KEY_SCORES = 'wlp:scores';

/** مفاتيح النسخ القديمة (التحدي اليومي/الإحصائيات) — بننضفها. */
const LEGACY_KEYS = [
  'wlp:stats:v1',
  'wlp:stats:v2',
  'wlp:daily:v1',
  'wlp:ima:daily:v1',
  'wlp:seen-help',
];

const hasStorage = () => {
  try {
    return typeof window !== 'undefined' && !!window.localStorage;
  } catch {
    return false;
  }
};

function get(key) {
  if (!hasStorage()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function set(key, value) {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* تجاهل */
  }
}

export function loadTheme() {
  return get(KEY_THEME) === 'light' ? 'light' : 'dark';
}

export function saveTheme(theme) {
  set(KEY_THEME, theme);
}

/** شاشة الشرح بتظهر أول زيارة بس. */
export function hasSeenHelp() {
  if (!hasStorage()) return true;
  return get(KEY_HELP) === '1';
}

export function markHelpSeen() {
  set(KEY_HELP, '1');
}

/** آخر لعبة اختارها المقدّم. */
export function loadQuizId() {
  return get(KEY_QUIZ);
}

export function saveQuizId(id) {
  set(KEY_QUIZ, id);
}

/** لغة الموقع: عربي (الافتراضي) أو إنجليزي. */
export function loadLang() {
  return get(KEY_LANG) === 'en' ? 'en' : 'ar';
}

export function saveLang(lang) {
  set(KEY_LANG, lang);
}

function parsePair(raw) {
  if (!raw) return null;

  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) && value.length >= 2 ? value : null;
  } catch {
    return null;
  }
}

/** أسماء الفريقين — مشتركة بين كل الألعاب. */
export function loadTeamNames() {
  const pair = parsePair(get(KEY_TEAMS)) ?? [];

  return [0, 1].map((index) =>
    typeof pair[index] === 'string' ? pair[index] : null,
  );
}

export function saveTeamNames(names) {
  set(KEY_TEAMS, JSON.stringify([names?.[0] ?? null, names?.[1] ?? null]));
}

/** هل المقدّم عدّى شاشة إعداد الفريقين؟ */
export function hasTeamSetup() {
  return get(KEY_TEAMS_SEEN) === '1';
}

export function markTeamSetupSeen() {
  set(KEY_TEAMS_SEEN, '1');
}

/** مجموع نقط الفريقين المتراكم في كل الألعاب. */
export function loadScores() {
  const pair = parsePair(get(KEY_SCORES)) ?? [];

  return [0, 1].map((index) =>
    Number.isFinite(pair[index]) ? Math.max(0, pair[index]) : 0,
  );
}

export function saveScores(scores) {
  set(
    KEY_SCORES,
    JSON.stringify([
      Number.isFinite(scores?.[0]) ? scores[0] : 0,
      Number.isFinite(scores?.[1]) ? scores[1] : 0,
    ]),
  );
}

/** شيل بيانات النسخ القديمة — مبقاش فيه إحصائيات ولا تحدي يومي. */
export function cleanupLegacyStorage() {
  if (!hasStorage()) return;
  try {
    for (const key of LEGACY_KEYS) {
      window.localStorage.removeItem(key);
    }
  } catch {
    /* تجاهل */
  }
}
