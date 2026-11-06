/** منطق لعبة «سؤال واحد» — توزيع ١٠ نقط على أربع اختيارات. */

export const DEFAULT_POINTS = 10;
export const DEFAULT_ROUNDS = 10;
export const OPTION_COUNT = 4;

/** توزيع فاضي: [0, 0, 0, 0]. */
export function createSplit(count = OPTION_COUNT) {
  return Array.from({ length: count }, () => 0);
}

/** مجموع النقط اللي اتوزّعت. */
export function splitTotal(split) {
  if (!Array.isArray(split)) return 0;
  return split.reduce(
    (sum, value) => sum + (Number.isFinite(value) ? value : 0),
    0,
  );
}

/** النقط اللي لسه متوزّعتش. */
export function remainingPoints(split, total = DEFAULT_POINTS) {
  return Math.max(0, total - splitTotal(split));
}

/** زيادة أو نقصان نقطة على اختيار واحد من غير ما يتعدى الإجمالي. */
export function adjustSplit(split, index, delta, total = DEFAULT_POINTS) {
  if (!Array.isArray(split) || index < 0 || index >= split.length) {
    return Array.isArray(split) ? [...split] : createSplit();
  }

  const next = [...split];
  const left = remainingPoints(next, total);
  const value = Math.max(0, Math.min(next[index] + delta, next[index] + left));

  next[index] = value;
  return next;
}

/** كتابة رقم مباشر لاختيار، مع الحفاظ على إن الإجمالي ما يتعداش. */
export function setSplitValue(split, index, value, total = DEFAULT_POINTS) {
  if (!Array.isArray(split) || index < 0 || index >= split.length) {
    return Array.isArray(split) ? [...split] : createSplit();
  }

  const next = [...split];
  const max = next[index] + remainingPoints(next, total);
  const parsed = Number.isFinite(value) ? Math.floor(value) : 0;

  next[index] = Math.max(0, Math.min(parsed, max));
  return next;
}

/** هل الفريق وزّع الـ١٠ نقط كلها؟ */
export function isSplitComplete(split, total = DEFAULT_POINTS) {
  return splitTotal(split) === total;
}

/** نقط الفريق في السؤال = اللي حاطه على الاختيار الصح. */
export function scoreForSplit(split, correctIndex) {
  if (!Array.isArray(split) || !Number.isInteger(correctIndex)) return 0;
  const value = split[correctIndex];
  return Number.isFinite(value) ? value : 0;
}

/** بيتحقق من توزيع جاهز (لازم ٤ أرقام ومجموعهم = الإجمالي). */
export function normalizePreset(preset, total = DEFAULT_POINTS) {
  if (!Array.isArray(preset) || preset.length !== OPTION_COUNT) return null;

  const values = preset.map((value) =>
    Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0,
  );

  return splitTotal(values) === total ? values : null;
}

/** التوزيعات السريعة اللي بتظهر للحكم. */
export const SPLIT_PRESETS = [
  { id: 'all', values: [10, 0, 0, 0] },
  { id: 'four-three-two-one', values: [4, 3, 2, 1] },
  { id: 'five-five', values: [5, 5, 0, 0] },
];

/** بيختار عدد أسئلة عشوائية من غير تكرار. */
export function pickQuestions(questions, count, random = Math.random) {
  if (!Array.isArray(questions) || count <= 0) return [];

  const pool = [...questions];
  const size = Math.min(count, pool.length);

  for (let index = 0; index < size; index += 1) {
    const pick = index + Math.floor(random() * (pool.length - index));
    [pool[index], pool[pick]] = [pool[pick], pool[index]];
  }

  return pool.slice(0, size);
}

/** صاحب أعلى نتيجة، أو null لو تعادل. */
export function winnerIndex(scores) {
  if (!Array.isArray(scores) || scores.length < 2) return null;
  if (scores[0] === scores[1]) return null;
  return scores[0] > scores[1] ? 0 : 1;
}
