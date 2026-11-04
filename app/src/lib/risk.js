/** منطق نقاط لعبة «ريسك» — منفصل عن الواجهة عشان يبقى سهل الاختبار. */

/**
 * قيمة التغيير في النقاط.
 * - صح عادي: + قيمة الخلية
 * - صح ريسك: + ضعف قيمة الخلية
 * - غلط عادي: 0
 * - غلط ريسك: − قيمة الخلية
 */
export function scoreDelta({ value, risk = false, correct = false }) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  if (correct) return risk ? value * 2 : value;
  return risk ? -value : 0;
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
