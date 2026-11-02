/**
 * كل لعبة عبارة عن «كويز» له نفس الشكل:
 *   { id, title, emoji, subtitle, answerLabel, nextLabel, kind, order, questions }
 *
 * الأسئلة نوعين:
 *   1. clues  → تلميحات نصية (زي لعبة «من أنا؟»)
 *   2. path   → مسار أندية بالترتيب (زي لعبة «المسار»)
 *
 * كل البيانات في ملفات JSON جوه app/src/data/quizzes/:
 *   - who-am-i.json  → لعبة «من أنا؟»
 *   - paths.json     → لعبة «المسار»
 * وأي ملف JSON جديد هناك بيتحوّل للعبة تلقائيًا.
 *
 * كل النصوص ممكن تكون:
 *   - نص عادي: "المسار"  → نفس النص في اللغتين
 *   - أو ثنائي اللغة: { "ar": "المسار", "en": "The Path" }
 * `order` بيحدد ترتيب اللعبة في الأزرار (الأصغر الأول).
 */
const quizModules = import.meta.glob('../data/quizzes/*.json', {
  eager: true,
  import: 'default',
});

export const LANGUAGES = ['ar', 'en'];

export function isLang(value) {
  return LANGUAGES.includes(value);
}

/** بيجيب النص باللغة المطلوبة من نص عادي أو كائن { ar, en }. */
export function pickText(value, lang = 'ar') {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value[lang] ?? value.ar ?? value.en ?? '';
  }
  return String(value);
}

/** بيحوّل مصفوفة نصوص ثنائية اللغة لمصفوفة باللغة المطلوبة. */
function pickList(value, lang) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => pickText(item, lang)).filter(Boolean);
}

function normalizeQuestion(raw, index, quizId) {
  const id = raw.id ?? `${quizId}-${index}`;

  const clues = Array.isArray(raw.clues)
    ? raw.clues
        .filter(Boolean)
        .map((clue, clueIndex) => ({
          id: `${id}-clue-${clueIndex}`,
          label: clue?.label ?? null,
          text: clue?.text ?? clue,
        }))
    : [];

  return {
    id,
    answer: raw.answer ?? '',
    clues,
    clubs: Array.isArray(raw.clubs) ? raw.clubs.filter(Boolean) : [],
    loans: Array.isArray(raw.loans) ? raw.loans : [],
    meta: Array.isArray(raw.meta) ? raw.meta : [],
    known: typeof raw.known === 'number' ? raw.known : null,
  };
}

function normalizeQuiz(raw, fallbackId) {
  const id = raw.id ?? fallbackId;
  const questions = (raw.questions ?? []).map((question, index) =>
    normalizeQuestion(question, index, id),
  );

  const kind =
    raw.kind ?? (questions.some((question) => question.clubs.length) ? 'path' : 'clues');

  return {
    id,
    title: raw.title ?? id,
    emoji: raw.emoji ?? '⚽',
    subtitle: raw.subtitle ?? '',
    answerLabel: raw.answerLabel ?? '',
    nextLabel: raw.nextLabel ?? '',
    kind,
    order: typeof raw.order === 'number' ? raw.order : 999,
    questions,
  };
}

const bilingualQuizzes = Object.entries(quizModules)
  .map(([path, raw]) => normalizeQuiz(raw, path.split('/').pop().replace('.json', '')))
  .filter((quiz) => quiz.questions.length > 0)
  .sort(
    (a, b) =>
      a.order - b.order || pickText(a.title, 'ar').localeCompare(pickText(b.title, 'ar'), 'ar'),
  );

/** بيحوّل لعبة كاملة للغة واحدة (نصوص مسطّحة جاهزة للعرض). */
function localizeQuiz(quiz, lang) {
  return {
    id: quiz.id,
    title: pickText(quiz.title, lang),
    emoji: quiz.emoji,
    subtitle: pickText(quiz.subtitle, lang),
    answerLabel: pickText(quiz.answerLabel, lang),
    nextLabel: pickText(quiz.nextLabel, lang),
    kind: quiz.kind,
    order: quiz.order,
    questions: quiz.questions.map((question) => ({
      id: question.id,
      answer: pickText(question.answer, lang),
      clues: question.clues.map((clue) => ({
        id: clue.id,
        label: clue.label ? pickText(clue.label, lang) : null,
        text: pickText(clue.text, lang),
      })),
      clubs: pickList(question.clubs, lang),
      loans: question.loans,
      meta: pickList(question.meta, lang),
      known: question.known,
    })),
  };
}

const localizedCache = new Map();

/** كل الألعاب مترجمة للغة المطلوبة. */
export function getQuizzes(lang = 'ar') {
  const code = isLang(lang) ? lang : 'ar';
  if (!localizedCache.has(code)) {
    localizedCache.set(
      code,
      bilingualQuizzes.map((quiz) => localizeQuiz(quiz, code)),
    );
  }
  return localizedCache.get(code);
}

export const QUIZZES = getQuizzes('ar');

/** بترجع سؤال عشوائي من الكويز، مع استبعاد آخر الأسئلة اللي ظهرت. */
export function pickQuestion(quiz, { excludeIds = [] } = {}) {
  const pool = quiz?.questions ?? [];
  if (pool.length === 0) return null;

  const excluded = new Set(excludeIds);
  const available = pool.filter((question) => !excluded.has(question.id));
  const source = available.length > 0 ? available : pool;

  return source[Math.floor(Math.random() * source.length)];
}

export function getQuiz(id, lang = 'ar') {
  const quizzes = getQuizzes(lang);
  return quizzes.find((quiz) => quiz.id === id) ?? quizzes[0];
}
