export const DEFAULT_TEAM_NAMES = {
  ar: ['الفريق الأول', 'الفريق الثاني'],
  en: ['Team One', 'Team Two'],
};

/** بيرجع أسماء الفريقين، وبالنص الافتراضي لو الاسم فاضي. */
export function resolveTeamNames(names, lang = 'ar') {
  const defaults = DEFAULT_TEAM_NAMES[lang] ?? DEFAULT_TEAM_NAMES.ar;

  return [0, 1].map((index) => {
    const name = names?.[index];
    return typeof name === 'string' && name.trim() ? name.trim() : defaults[index];
  });
}

/** بيضيف أو يشيل نقط من فريق واحد، ومش بينزل تحت الصفر. */
export function addTeamPoints(scores, teamIndex, delta) {
  const current = Array.isArray(scores) ? scores : [0, 0];
  const next = [Number(current[0]) || 0, Number(current[1]) || 0];

  if (teamIndex !== 0 && teamIndex !== 1) return next;

  next[teamIndex] = Math.max(0, next[teamIndex] + (Number(delta) || 0));
  return next;
}
