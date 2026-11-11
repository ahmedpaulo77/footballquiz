/**
 * كل لعبة عبارة عن «كويز» له نفس الشكل:
 *   { id, title, emoji, subtitle, answerLabel, nextLabel, kind, order, questions }
 *
 * الأسئلة أنواعها:
 *   1. clues  → تلميحات نصية (زي لعبة «من أنا؟»)
 *   2. path   → مسار أندية بالترتيب (زي لعبة «المسار»)
 *   3. risk   → خلايا لوحة فئات ونقاط (زي لعبة «ريسك»)
 *   4. points → سؤال بأربع اختيارات وتوزيع ١٠ نقط (زي لعبة «سؤال واحد»)
 *   5. top3   → ٩ أسماء واللعيبة تختار التلاتة اللي على القمة (زي لعبة «توب 3»)
 *   6. lineups → كروت مباريات بتفتح التشكيل الأساسي (زي لعبة «تشكيلات المباريات»)
 *
 * كل البيانات في ملفات JSON جوه app/src/data/quizzes/:
 *   - who-am-i.json     → لعبة «من أنا؟»
 *   - paths.json        → لعبة «المسار»
 *   - risk.json         → لعبة «ريسك»
 *   - one-question.json → لعبة «100 نقطة»
 *   - top-three.json    → لعبة «توب 3»
 *   - lineups.json      → لعبة «تشكيلات المباريات»
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

  const options = Array.isArray(raw.options) ? raw.options.filter(Boolean) : [];
  const correct =
    Number.isInteger(raw.correct) && raw.correct >= 0 && raw.correct < options.length
      ? raw.correct
      : null;

  const players = Array.isArray(raw.players)
    ? raw.players
        .filter((player) => player && player.name != null)
        .map((player) => ({
          name: player.name ?? '',
          stat: Number.isFinite(player.stat) ? player.stat : null,
        }))
    : [];

  const top = Array.isArray(raw.top)
    ? raw.top.filter(
        (index, position, list) =>
          Number.isInteger(index) &&
          index >= 0 &&
          index < players.length &&
          list.indexOf(index) === position,
      )
    : [];

  return {
    id,
    answer: raw.answer ?? (correct == null ? '' : options[correct] ?? ''),
    question: raw.question ?? '',
    category: raw.category ?? '',
    value: typeof raw.value === 'number' ? raw.value : null,
    options,
    correct,
    players,
    top,
    asc: raw.asc === true,
    unit: raw.unit ?? '',
    clues,
    clubs: Array.isArray(raw.clubs) ? raw.clubs.filter(Boolean) : [],
    loans: Array.isArray(raw.loans) ? raw.loans : [],
    meta: Array.isArray(raw.meta) ? raw.meta : [],
    known: typeof raw.known === 'number' ? raw.known : null,
    gulf: raw.gulf === true,
  };
}

function normalizeLineupPlayer(raw, index, matchId, side) {
  if (!raw) return null;

  const name = raw.name ?? raw;
  const group = ['GK', 'DF', 'MF', 'FW'].includes(raw.group) ? raw.group : 'MF';

  return {
    id: `${matchId}-${side}-${index}`,
    pos: raw.pos ?? '',
    group,
    name,
  };
}

function normalizeLineup(raw, matchId, side) {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((player, index) => normalizeLineupPlayer(player, index, matchId, side))
    .filter((player) => player && player.name != null && player.name !== '');
}

function normalizeMatch(raw, index, quizId) {
  const id = raw.id ?? `${quizId}-match-${index}`;

  return {
    id,
    competition: raw.competition ?? '',
    year: Number.isFinite(raw.year) ? raw.year : null,
    home: raw.home ?? '',
    away: raw.away ?? '',
    score: raw.score ?? '',
    winner: raw.winner ?? null,
    decidedBy: raw.decidedBy ?? 'regulation',
    shootout: raw.shootout ?? null,
    difficulty: raw.difficulty ?? 'medium',
    homeLineup: normalizeLineup(raw.homeLineup, id, 'home'),
    awayLineup: normalizeLineup(raw.awayLineup, id, 'away'),
    source: typeof raw.source === 'string' ? raw.source : '',
    label: raw.label ?? null,
    gulf: raw.gulf === true,
  };
}

function normalizeQuiz(raw, fallbackId) {
  const id = raw.id ?? fallbackId;
  const questions = (raw.questions ?? []).map((question, index) =>
    normalizeQuestion(question, index, id),
  );

  const categories = (raw.categories ?? []).map((category, index) => ({
    id: category?.id ?? `${id}-category-${index}`,
    title: category?.title ?? category?.id ?? '',
    emoji: category?.emoji ?? '⚽',
  }));

  const competitions = (raw.competitions ?? []).map((competition, index) => ({
    id: competition?.id ?? `${id}-competition-${index}`,
    title:
      competition?.title ?? {
        ar: competition?.ar ?? competition?.en ?? '',
        en: competition?.en ?? competition?.ar ?? '',
      },
  }));

  const matches = (raw.matches ?? []).map((match, index) =>
    normalizeMatch(match, index, id),
  );

  const values = Array.isArray(raw.values)
    ? raw.values.filter((value) => typeof value === 'number')
    : [...new Set(questions.map((question) => question.value).filter((value) => value != null))].sort(
        (a, b) => a - b,
      );

  const kind =
    raw.kind ??
    (questions.some((question) => question.clubs.length)
      ? 'path'
      : questions.some((question) => question.players.length)
        ? 'top3'
        : questions.some((question) => question.options.length)
          ? 'points'
          : 'clues');

  return {
    id,
    title: raw.title ?? id,
    emoji: raw.emoji ?? '⚽',
    subtitle: raw.subtitle ?? '',
    answerLabel: raw.answerLabel ?? '',
    nextLabel: raw.nextLabel ?? '',
    kind,
    order: typeof raw.order === 'number' ? raw.order : 999,
    pointsPerQuestion:
      typeof raw.pointsPerQuestion === 'number' ? raw.pointsPerQuestion : 10,
    questionsPerGame:
      typeof raw.questionsPerGame === 'number' ? raw.questionsPerGame : 10,
    picksCount: typeof raw.picksCount === 'number' ? raw.picksCount : 3,
    categories,
    values,
    questions,
    competitions,
    matches,
  };
}

const bilingualQuizzes = Object.entries(quizModules)
  .map(([path, raw]) => normalizeQuiz(raw, path.split('/').pop().replace('.json', '')))
  .filter((quiz) => quiz.questions.length > 0 || quiz.matches.length > 0)
  .sort(
    (a, b) =>
      a.order - b.order || pickText(a.title, 'ar').localeCompare(pickText(b.title, 'ar'), 'ar'),
  );

/** بيحوّل لعبة كاملة للغة واحدة (نصوص مسطّحة جاهزة للعرض). */
function localizeQuiz(quiz, lang) {
  const competitionTitles = new Map(
    quiz.competitions.map((competition) => [
      competition.id,
      pickText(competition.title, lang),
    ]),
  );

  return {
    id: quiz.id,
    title: pickText(quiz.title, lang),
    emoji: quiz.emoji,
    subtitle: pickText(quiz.subtitle, lang),
    answerLabel: pickText(quiz.answerLabel, lang),
    nextLabel: pickText(quiz.nextLabel, lang),
    kind: quiz.kind,
    order: quiz.order,
    pointsPerQuestion: quiz.pointsPerQuestion,
    questionsPerGame: quiz.questionsPerGame,
    picksCount: quiz.picksCount,
    categories: quiz.categories.map((category) => ({
      id: category.id,
      title: pickText(category.title, lang),
      emoji: category.emoji,
    })),
    values: quiz.values,
    competitions: quiz.competitions.map((competition) => ({
      id: competition.id,
      title: pickText(competition.title, lang),
    })),
    matches: quiz.matches.map((match) => ({
      id: match.id,
      competition: match.competition,
      competitionTitle: competitionTitles.get(match.competition) ?? '',
      year: match.year,
      home: pickText(match.home, lang),
      away: pickText(match.away, lang),
      score: match.score,
      winner: match.winner,
      decidedBy: match.decidedBy,
      shootout: match.shootout,
      difficulty: match.difficulty,
      homeLineup: match.homeLineup.map((player) => ({
        id: player.id,
        pos: player.pos,
        group: player.group,
        name: pickText(player.name, lang),
      })),
      awayLineup: match.awayLineup.map((player) => ({
        id: player.id,
        pos: player.pos,
        group: player.group,
        name: pickText(player.name, lang),
      })),
      source: match.source,
      label: match.label ? pickText(match.label, lang) : '',
      gulf: match.gulf === true,
    })),
    questions: quiz.questions.map((question) => ({
      id: question.id,
      answer: pickText(question.answer, lang),
      question: pickText(question.question, lang),
      category: pickText(question.category, lang),
      value: question.value,
      options: question.options.map((option) => pickText(option, lang)),
      correct: question.correct,
      players: question.players.map((player) => ({
        name: pickText(player.name, lang),
        stat: player.stat,
      })),
      top: question.top,
      asc: question.asc,
      unit: pickText(question.unit, lang),
      clues: question.clues.map((clue) => ({
        id: clue.id,
        label: clue.label ? pickText(clue.label, lang) : null,
        text: pickText(clue.text, lang),
      })),
      clubs: pickList(question.clubs, lang),
      loans: question.loans,
      meta: pickList(question.meta, lang),
      known: question.known,
      gulf: question.gulf === true,
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
