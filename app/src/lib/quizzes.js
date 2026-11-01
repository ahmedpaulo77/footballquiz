import { PLAYABLE_PLAYERS } from '../data/players.js';
import { buildClues } from './game.js';

/**
 * كل لعبة عبارة عن «كويز» له نفس الشكل:
 *   { id, title, emoji, subtitle, answerLabel, nextLabel, kind, questions }
 *
 * الأسئلة نوعين:
 *   1. clues  → تلميحات نصية (زي لعبة «من أنا؟»)
 *   2. path   → مسار أندية بالترتيب (زي لعبة «المسار»)
 *
 * أي ملف JSON جديد في app/src/data/quizzes/ بيتحوّل للعبة تلقائيًا.
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
    questions,
  };
}

/** لعبة «من أنا؟» — تلميحاتها بتتبني من بنك اللاعبين. */
function buildWhoAmIQuiz() {
  return {
    id: 'who-am-i',
    title: 'من أنا؟',
    emoji: '⚽',
    subtitle: '٣ تلميحات لكل لاعب كورة',
    answerLabel: 'اسم اللاعب',
    nextLabel: 'لاعب تاني',
    kind: 'clues',
    questions: PLAYABLE_PLAYERS.map((player) => ({
      id: player.id,
      answer: player.name,
      clues: buildClues(player),
      clubs: [],
      loans: [],
      meta: [
        `${player.nationality} · ${player.club}`,
        `${player.position} · ${player.league} · ${player.age} سنة`,
      ],
      known: null,
    })),
  };
}

const jsonQuizzes = Object.entries(quizModules)
  .map(([path, raw]) => normalizeQuiz(raw, path.split('/').pop().replace('.json', '')))
  .filter((quiz) => quiz.questions.length > 0)
  .sort((a, b) => a.title.localeCompare(b.title, 'ar'));

export const QUIZZES = [buildWhoAmIQuiz(), ...jsonQuizzes];

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
