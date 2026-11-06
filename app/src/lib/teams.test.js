import { describe, expect, it } from 'vitest';
import {
  DEFAULT_TEAM_NAMES,
  addTeamPoints,
  resolveTeamNames,
} from './teams.js';

describe('أسماء الفريقين', () => {
  it('بيستخدم الافتراضي لو الاسم فاضي', () => {
    expect(resolveTeamNames([null, '  '], 'ar')).toEqual(
      DEFAULT_TEAM_NAMES.ar,
    );
    expect(resolveTeamNames([], 'en')).toEqual(DEFAULT_TEAM_NAMES.en);
  });

  it('بيحتفظ بالأسماء المكتوبة ويشيل المسافات', () => {
    expect(resolveTeamNames(['  أحمد  ', 'محمد'], 'ar')).toEqual([
      'أحمد',
      'محمد',
    ]);
  });

  it('لو اللغة مش معروفة بيرجع العربي', () => {
    expect(resolveTeamNames([null, null], 'fr')).toEqual(
      DEFAULT_TEAM_NAMES.ar,
    );
  });
});

describe('نقط الفريقين', () => {
  it('بيضيف النقط للفريق الصح', () => {
    expect(addTeamPoints([3, 7], 0, 10)).toEqual([13, 7]);
    expect(addTeamPoints([3, 7], 1, 20)).toEqual([3, 27]);
  });

  it('مش بينزل تحت الصفر', () => {
    expect(addTeamPoints([2, 0], 0, -5)).toEqual([0, 0]);
  });

  it('بيتجاهل فريق غلط أو مجموع مش صالح', () => {
    expect(addTeamPoints([4, 5], 2, 10)).toEqual([4, 5]);
    expect(addTeamPoints(null, 0, 10)).toEqual([10, 0]);
  });
});
