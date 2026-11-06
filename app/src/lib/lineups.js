export const MATCH_POINTS = {
  easy: 10,
  medium: 20,
  hard: 30,
};

/** نقط سؤال التشكيلات حسب صعوبة الماتش. */
export function pointsForMatch(match) {
  return MATCH_POINTS[match?.difficulty] ?? MATCH_POINTS.easy;
}
