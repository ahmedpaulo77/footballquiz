/**
 * فلتر «الكرة الخليجية» — بيقسم الأسئلة/الماتشات بين عام وخليجي.
 * السؤال الخليجي عليه علم `gulf: true` في الـJSON، ولازم يكون:
 *   - الفلتر العادي (gulfMode = false) بيستبعد الخليجي خالص.
 *   - فلتر الخليج (gulfMode = true) بيرجعه هو بس.
 */
export function selectGulfPool(items, gulfMode) {
  return (items ?? []).filter((item) => (gulfMode ? item.gulf === true : item.gulf !== true));
}
