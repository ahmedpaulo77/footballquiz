/** منطق لعبة «توب 3» — ٩ أسماء واللعيبة تختار التلاتة اللي على القمة. */

export const DEFAULT_PICKS = 3;
export const DEFAULT_ROUNDS = 8;
export const BONUS_ALL_CORRECT = 3;

/** بيضيف أو بيشيل اسم من اختيارات الفريق، بحد أقصى ٣. */
export function togglePick(picks, index, limit = DEFAULT_PICKS) {
  const current = Array.isArray(picks) ? picks : [];

  if (!Number.isInteger(index) || index < 0) return [...current];
  if (current.includes(index)) return current.filter((pick) => pick !== index);
  if (current.length >= limit) return [...current];

  return [...current, index];
}

/** هل الفريق اختار العدد المطلوب؟ */
export function isPicksComplete(picks, limit = DEFAULT_PICKS) {
  return Array.isArray(picks) && picks.length === limit;
}

/** عدد الاختيارات الصح. */
export function correctPicks(picks, top) {
  if (!Array.isArray(picks) || !Array.isArray(top)) return 0;

  const answers = new Set(top);
  return picks.filter((pick) => answers.has(pick)).length;
}

/** نقاط الفريق: نقطة لكل اسم صح + بونص لو جاب التلاتة كلهم. */
export function gainForPicks(picks, top, bonus = BONUS_ALL_CORRECT) {
  const hits = correctPicks(picks, top);
  const allCorrect = Array.isArray(top) && top.length > 0 && hits === top.length;

  return allCorrect ? hits + bonus : hits;
}
