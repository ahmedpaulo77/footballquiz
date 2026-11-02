/**
 * كل لعبة عبارة عن «كويز» له نفس الشكل:
 *   { id, title, emoji, subtitle, answerLabel, nextLabel, kind, order, questions }
 *
 * الأسئلة نوعين:
 *   1. clues  → تلميحات نصية (زي لعبة «من أنا؟»)
 *   2. path   → مسار أندية بالترتيب (زي لعبة «المسار»)
 *
 * كل البيانات بقت في ملفات JSON جوه app/src/data/quizzes/:
 *   - who-am-i.json  → لعبة «من أنا؟»
 *   - paths.json     → لعبة «المسار»
 * وأي ملف JSON جديد هناك بيتحوّل للعبة تلقائيًا.
 * `order` بيحدد ترتيب اللعبة في الأزرار (الأصغر الأول).
 */
const quizModules = import.meta.glob('../data/quizzes/*.json', {
  eager: true,
  import: 'default',
});

function normalizeQuestion(raw, index, quizId) {
  const id = raw.id ?? `${quizId}-${index}`;

  const clues = Array.isArray(raw.clues)
    ? raw.clues.filter(Boolean).map((text, clueIndex) => ({
        id: `${id}-clue-${clueIndex}`,
        label: raw.labels?.[clueIndex] ?? `تلميح ${clueIndex + 1}`,
        text,
      }))
    : [];

  return {
    id,
    answer: raw.answer ?? '',
    clues,
    clubs: Array.isArray(raw.clubs) ? raw.clubs.filter(Boolean) : [],
    loans: Array.isArray(raw.loans) ? raw.loans : [],
    meta: Array.isArray(raw.meta) ? raw.meta.filter(Boolean) : [],
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
    answerLabel: raw.answerLabel ?? 'الإجابة',
    nextLabel: raw.nextLabel ?? 'سؤال تاني',
    kind,
    order: typeof raw.order === 'number' ? raw.order : 999,
    questions,
  };
}

const jsonQuizzes = Object.entries(quizModules)
  .map(([path, raw]) => normalizeQuiz(raw, path.split('/').pop().replace('.json', '')))
  .filter((quiz) => quiz.questions.length > 0)
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, 'ar'));

export const QUIZZES = jsonQuizzes;

/** بترجع سؤال عشوائي من الكويز، مع استبعاد آخر الأسئلة اللي ظهرت. */
export function pickQuestion(quiz, { excludeIds = [] } = {}) {
  const pool = quiz?.questions ?? [];
  if (pool.length === 0) return null;

  const excluded = new Set(excludeIds);
  const available = pool.filter((question) => !excluded.has(question.id));
  const source = available.length > 0 ? available : pool;

  return source[Math.floor(Math.random() * source.length)];
}

export function getQuiz(id) {
  return QUIZZES.find((quiz) => quiz.id === id) ?? QUIZZES[0];
}
