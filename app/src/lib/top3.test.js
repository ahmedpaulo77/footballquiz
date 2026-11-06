import { describe, expect, it } from 'vitest';
import {
  BONUS_ALL_CORRECT,
  DEFAULT_PICKS,
  correctPicks,
  gainForPicks,
  isPicksComplete,
  togglePick,
} from './top3.js';

describe('اختيارات لعبة «توب 3»', () => {
  it('بيضيف الاختيار وبيشيله لما تدوس تاني', () => {
    let picks = togglePick([], 2);
    expect(picks).toEqual([2]);

    picks = togglePick(picks, 2);
    expect(picks).toEqual([]);
  });

  it('مش بيسمح بأكتر من ٣ اختيارات', () => {
    let picks = togglePick([], 0);
    picks = togglePick(picks, 1);
    picks = togglePick(picks, 2);
    picks = togglePick(picks, 3);

    expect(picks).toHaveLength(DEFAULT_PICKS);
    expect(picks).toEqual([0, 1, 2]);
  });

  it('بيتجاهل الاختيارات الغلط', () => {
    expect(togglePick([1], -1)).toEqual([1]);
    expect(togglePick([1], 1.5)).toEqual([1]);
    expect(togglePick(null, 1)).toEqual([1]);
  });

  it('الاختيار بيكتمل لما يوصل ٣', () => {
    expect(isPicksComplete([0, 1])).toBe(false);
    expect(isPicksComplete([0, 1, 2])).toBe(true);
    expect(isPicksComplete(null)).toBe(false);
  });
});

describe('نقاط لعبة «توب 3»', () => {
  const top = [2, 5, 7];

  it('بيحسب عدد الاختيارات الصح', () => {
    expect(correctPicks([2, 5, 7], top)).toBe(3);
    expect(correctPicks([2, 0, 1], top)).toBe(1);
    expect(correctPicks([0, 1, 3], top)).toBe(0);
  });

  it('كل اختيار صح بنقطة', () => {
    expect(gainForPicks([2, 0, 1], top)).toBe(1);
    expect(gainForPicks([2, 5, 0], top)).toBe(2);
  });

  it('التلاتة كاملين بياخدوا بونص ٣', () => {
    expect(gainForPicks([2, 5, 7], top)).toBe(3 + BONUS_ALL_CORRECT);
  });

  it('مفيش نقاط لو مفيش اختيارات أو مفيش إجابة', () => {
    expect(gainForPicks([], top)).toBe(0);
    expect(gainForPicks([2, 5, 7], [])).toBe(0);
    expect(gainForPicks(null, top)).toBe(0);
  });
});
