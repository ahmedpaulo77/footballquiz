/**
 * صفحات الموقع النصية اللي بتظهر في فوتر كل الصفحات.
 * نفس الليستة موجودة كمان في صفحات guide-*.html و about.html و privacy.html،
 * فأي إضافة جديدة لازم تتضاف هنا وفي الفوتر الثابت هناك.
 */
export const SITE_PAGES = [
  { href: './index.html', ar: 'الرئيسية', en: 'Home' },
  { href: './guides.html', ar: 'دليل الألعاب', en: 'Game guides' },
  { href: './guide-who-am-i.html', ar: 'دليل من أنا؟', en: 'Who Am I? guide' },
  { href: './guide-paths.html', ar: 'دليل المسار', en: 'The Path guide' },
  { href: './guide-risk.html', ar: 'دليل ريسك', en: 'Risk guide' },
  { href: './guide-one-question.html', ar: 'دليل 100 نقطة', en: '100 Points guide' },
  { href: './guide-top-three.html', ar: 'دليل توب 3', en: 'Top 3 guide' },
  { href: './guide-lineups.html', ar: 'دليل التشكيلات', en: 'Lineups guide' },
  { href: './guide-cards.html', ar: 'دليل الكروت', en: 'Cards guide' },
  { href: './about.html', ar: 'عن الموقع', en: 'About' },
  { href: './privacy.html', ar: 'سياسة الخصوصية', en: 'Privacy Policy' },
];

/** رابط دليل اللعبة الحالية. */
export function guideHref(quizId) {
  return `./guide-${quizId}.html`;
}
