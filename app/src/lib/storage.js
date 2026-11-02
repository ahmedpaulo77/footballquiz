const KEY_THEME = 'wlp:theme';
const KEY_HELP = 'wlp:help:seen';
const KEY_QUIZ = 'wlp:quiz';
const KEY_LANG = 'wlp:lang';

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
