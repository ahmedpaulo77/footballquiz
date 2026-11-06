import { describe, expect, it } from 'vitest';
import {
  adjustSplit,
  createSplit,
  isSplitComplete,
  normalizePreset,
  pickQuestions,
  remainingPoints,
  scoreForSplit,
  setSplitValue,
  splitTotal,
  winnerIndex,
} from './points.js';

describe('توزيع نقط «سؤال واحد»', () => {
  it('بيبدأ بأربع اختيارات فاضية', () => {
    expect(createSplit()).toEqual([0, 0, 0, 0]);
    expect(splitTotal(createSplit())).toBe(0);
    expect(remainingPoints(createSplit())).toBe(10);
  });

  it('الزيادة بتقف عند الـ١٠ نقط', () => {
    let split = createSplit();
    for (let index = 0; index < 12; index += 1) split = adjustSplit(split, 0, 1);

    expect(split).toEqual([10, 0, 0, 0]);
    expect(remainingPoints(split)).toBe(0);
    expect(isSplitComplete(split)).toBe(true);
  });

  it('النقصان مش بيرجع تحت الصفر', () => {
    const split = adjustSplit([3, 7, 0, 0], 0, -5);

    expect(split).toEqual([0, 7, 0, 0]);
  });

  it('الزيادة على اختيار تاني بتقف عند إجمالي الـ١٠', () => {
    let split = [4, 2, 0, 0];
    split = adjustSplit(split, 2, 5);

    expect(splitTotal(split)).toBe(10);
    expect(split[2]).toBe(4);
  });

  it('توزيع حر 10/0/0/0 مقبول', () => {
    const split = adjustSplit(createSplit(), 1, 10);

    expect(split).toEqual([0, 10, 0, 0]);
    expect(isSplitComplete(split)).toBe(true);
  });

  it('نقط الفريق = اللي على الاختيار الصح بس', () => {
    expect(scoreForSplit([2, 5, 3, 0], 1)).toBe(5);
    expect(scoreForSplit([2, 5, 3, 0], 3)).toBe(0);
    expect(scoreForSplit([2, 5, 3, 0], 9)).toBe(0);
  });

  it('الكتابة المباشرة بتحط الرقم زي ما هو لو في مساحة', () => {
    expect(setSplitValue([0, 0, 0, 0], 0, 6)).toEqual([6, 0, 0, 0]);
    expect(setSplitValue([2, 3, 0, 0], 2, 5)).toEqual([2, 3, 5, 0]);
  });

  it('الكتابة بتقف عند المتاح من غير ما الإجمالي يتعدى ١٠', () => {
    expect(setSplitValue([4, 0, 0, 0], 1, 9)).toEqual([4, 6, 0, 0]);
    expect(setSplitValue([4, 2, 3, 1], 0, 7)).toEqual([4, 2, 3, 1]);
  });

  it('الكتابة بتظبط السالب والكسور', () => {
    expect(setSplitValue([4, 0, 0, 0], 1, -3)).toEqual([4, 0, 0, 0]);
    expect(setSplitValue([4, 0, 0, 0], 1, 2.9)).toEqual([4, 2, 0, 0]);
  });

  it('التوزيع الجاهز لازم يكون ٤ أرقام ومجموعه ١٠', () => {
    expect(normalizePreset([4, 3, 2, 1])).toEqual([4, 3, 2, 1]);
    expect(normalizePreset([4, 3, 2])).toBeNull();
    expect(normalizePreset([4, 3, 2, 2])).toBeNull();
    expect(normalizePreset([10, 0, 0, 0])).toEqual([10, 0, 0, 0]);
  });
});

describe('اختيار أسئلة «سؤال واحد»', () => {
  const questions = Array.from({ length: 60 }, (_, index) => ({ id: `q${index}` }));

  it('بيختار ١٠ أسئلة من غير تكرار', () => {
    const picked = pickQuestions(questions, 10);

    expect(picked).toHaveLength(10);
    expect(new Set(picked.map((question) => question.id)).size).toBe(10);
  });

  it('لو البنك أصغر من العدد بيرجع كل المتاح', () => {
    expect(pickQuestions(questions.slice(0, 4), 10)).toHaveLength(4);
    expect(pickQuestions(null, 10)).toEqual([]);
  });
});

describe('نتيجة «سؤال واحد»', () => {
  it('بيحدد الفريق الأعلى', () => {
    expect(winnerIndex([40, 30])).toBe(0);
    expect(winnerIndex([30, 40])).toBe(1);
  });

  it('التعادل بيرجع null', () => {
    expect(winnerIndex([40, 40])).toBeNull();
  });
});
