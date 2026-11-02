/**
 * مسار الأندية — اللاعب مخفي، والأندية هي الدليل.
 * الاتجاه بيتبع لغة الصفحة (يمين لشمال في العربي، شمال ليمين في الإنجليزي)،
 * والنجمة معناها إعارة.
 */
export default function PathList({ clubs = [], loans = [], ui }) {
  const rtl = ui?.dir === 'rtl';

  return (
    <section className="path-card" aria-label={ui?.pathAria}>
      <span className="path-eyebrow">{ui?.pathEyebrow}</span>

      <div className="path-list">
        {clubs.map((club, index) => (
          <span className="path-step" key={`${club}-${index}`}>
            <span className="path-chip" dir="ltr">
              {club}
              {loans.includes(index) ? (
                <span className="path-loan">{ui?.loan}</span>
              ) : null}
            </span>

            {index < clubs.length - 1 ? (
              <span className="path-arrow" aria-hidden="true">
                {rtl ? '←' : '→'}
              </span>
            ) : null}
          </span>
        ))}
      </div>
    </section>
  );
}
