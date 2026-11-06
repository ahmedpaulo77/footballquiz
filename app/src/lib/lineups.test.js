import { describe, expect, it } from 'vitest';
import { MATCH_POINTS, pointsForMatch } from './lineups.js';

describe('نقط لعبة التشكيلات', () => {
  it('سهل ١٠ ومتوسط ٢٠ وصعب ٣٠', () => {
    expect(pointsForMatch({ difficulty: 'easy' })).toBe(10);
    expect(pointsForMatch({ difficulty: 'medium' })).toBe(20);
    expect(pointsForMatch({ difficulty: 'hard' })).toBe(30);
  });

  it('لو الصعوبة مش معروفة بيرجع ١٠', () => {
    expect(pointsForMatch({})).toBe(10);
    expect(pointsForMatch(null)).toBe(10);
  });

  it('القيم ثابتة ومظبوطة', () => {
    expect(MATCH_POINTS).toEqual({ easy: 10, medium: 20, hard: 30 });
  });
});
