/**
 * مسار الأندية — اللاعب مخفي، والأندية هي الدليل.
 * الاتجاه من اليمين للشمال (زي الترتيب الزمني في العربي)، والنجمة معناها إعارة.
 */
export default function PathList({ clubs = [], loans = [] }) {
  return (
    <section className="path-card" aria-label="مسار الأندية">
      <span className="path-eyebrow">المسار</span>

      <div className="path-list">
        {clubs.map((club, index) => (
          <span className="path-step" key={`${club}-${index}`}>
            <span className="path-chip" dir="ltr">
              {club}
              {loans.includes(index) ? <span className="path-loan">إعارة</span> : null}
            </span>

            {index < clubs.length - 1 ? (
              <span className="path-arrow" aria-hidden="true">
                ←
              </span>
            ) : null}
          </span>
        ))}
      </div>
    </section>
  );
}
