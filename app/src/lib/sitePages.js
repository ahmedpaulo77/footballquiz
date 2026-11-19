/**
 * صفحات الموقع النصية اللي بتظهر في فوتر كل الصفحات.
 * نفس الليستة موجودة كمان في صفحات guide-*.html و about.html و privacy.html،
 * فأي إضافة جديدة لازم تتضاف هنا وفي الفوتر الثابت هناك.
 */
export const SITE_PAGES = [
  { href: './', ar: 'الرئيسية', en: 'Home' },
  { href: './guides', ar: 'دليل الألعاب', en: 'Game guides' },
  { href: './guide-who-am-i', ar: 'دليل من أنا؟', en: 'Who Am I? guide' },
  { href: './guide-paths', ar: 'دليل المسار', en: 'The Path guide' },
  { href: './guide-risk', ar: 'دليل ريسك', en: 'Risk guide' },
  { href: './guide-one-question', ar: 'دليل 100 نقطة', en: '100 Points guide' },
  { href: './guide-top-three', ar: 'دليل توب 3', en: 'Top 3 guide' },
  { href: './guide-lineups', ar: 'دليل التشكيلات', en: 'Lineups guide' },
  { href: './guide-cards', ar: 'دليل الكروت', en: 'Cards guide' },
  { href: './about', ar: 'عن الموقع', en: 'About' },
  { href: './privacy', ar: 'سياسة الخصوصية', en: 'Privacy Policy' },
];

/** رابط بورتفليو المطوّر — بيظهر في فوتر كل الصفحات. */
export const DEVELOPER_PORTFOLIO = {
  href: 'https://ahmedpaulo77.github.io/me/',
  ar: 'بورتفليو المطوّر',
  en: 'Developer portfolio',
};

/** رابط دليل اللعبة الحالية. */
export function guideHref(quizId) {
  return `./guide-${quizId}`;
}
