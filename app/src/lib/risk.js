/** منطق نقاط لعبة «ريسك» — منفصل عن الواجهة عشان يبقى سهل الاختبار. */

/**
 * قيمة التغيير في النقاط.
 * - صح عادي: + قيمة الخلية
 * - صح على خلية الدبل: + ضعف قيمة الخلية
 * - غلط في الحالتين: 0
 */
export function scoreDelta({ value, double = false, correct = false }) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  if (!correct) return 0;
  return double ? value * 2 : value;
}

/** شكل التغيير للعرض: +20 / −10 / 0 */
export function scoreLabel(delta) {
  if (!Number.isFinite(delta) || delta === 0) return '0';
  return delta > 0 ? `+${delta}` : `−${Math.abs(delta)}`;
}

/** هل كل خلايا اللوحة اتلعبت؟ */
export function isBoardComplete(questions, usedIds) {
  if (!Array.isArray(questions) || questions.length === 0) return false;
  const used = usedIds instanceof Set ? usedIds : new Set(usedIds ?? []);
  return questions.every((question) => used.has(question.id));
}

/** الخلية اللي بتجمع فئة وقيمة معينة. */
export function findCell(questions, categoryId, value) {
  return (
    questions.find(
      (question) => question.category === categoryId && question.value === value,
    ) ?? null
  );
}
