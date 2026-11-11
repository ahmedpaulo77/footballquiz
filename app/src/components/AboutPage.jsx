export default function AboutPage({ open, lang, onClose }) {
  if (!open) return null;

  const isAr = lang === 'ar';

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={isAr ? 'عن الموقع' : 'About'}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box static-page-modal" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="modal-head">
          <h2 className="modal-title">
            {isAr ? 'عن الكويرة' : 'About EL kwayra'}
          </h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label={isAr ? 'إغلاق' : 'Close'}
          >
            ✕
          </button>
        </div>

        <div className="static-page-body">
          {isAr ? (
            <>
              <div className="about-hero">
                <span className="about-emoji" aria-hidden="true">⚽</span>
                <h3 className="about-tagline">لعبة كورة للجميع</h3>
              </div>

              <p>
                <strong>الكويرة</strong> موقع ألعاب وأسئلة كورة قدم مجانية،
                مصمّم للعب الجماعي مع الأصحاب والعيلة. واحد يمسك الموبايل
                أو اللابتوب ويكون حكم، والباقي يخمّنوا.
              </p>

              <h3>إيه اللي فيه؟</h3>
              <ul>
                <li>🕵️ <strong>من أنا؟</strong> — تلميحات عن لاعب، اعرفه قبل ما التلميحات تخلص.</li>
                <li>🗺️ <strong>المسار</strong> — مسار أندية لاعب بالترتيب، اعرف مين هو.</li>
                <li>⚡ <strong>ريسك</strong> — لوحة فئات ونقاط لفريقين.</li>
                <li>💯 <strong>١٠٠ نقطة</strong> — وزّع نقاطك على الإجابات الصح.</li>
                <li>🏆 <strong>توب ٣</strong> — اختار ٣ من ٩ أسماء صح.</li>
                <li>📋 <strong>تشكيلات المباريات</strong> — خمّن لاعبي المباريات المشهورة.</li>
              </ul>

              <h3>التواصل</h3>
              <p>
                أي اقتراح أو استفسار؟ راسلنا على:{' '}
                <a href="mailto:p638599@gmail.com">p638599@gmail.com</a>
              </p>

              <p className="about-footer-note">
                الكويرة © 2026 — نص فقط، بدون صور لاعبين أو شعارات أندية.
              </p>
            </>
          ) : (
            <>
              <div className="about-hero">
                <span className="about-emoji" aria-hidden="true">⚽</span>
                <h3 className="about-tagline">A football quiz for everyone</h3>
              </div>

              <p>
                <strong>EL kwayra</strong> is a free football quiz site designed
                for group play with friends and family. One person acts as the
                host, and everyone else guesses.
              </p>

              <h3>What's inside?</h3>
              <ul>
                <li>🕵️ <strong>Who Am I?</strong> — Clues about a player. Guess before they run out.</li>
                <li>🗺️ <strong>The Path</strong> — A player's club path in order. Work out who it is.</li>
                <li>⚡ <strong>Risk</strong> — A category board with points for two teams.</li>
                <li>💯 <strong>100 Points</strong> — Spread your points across the right answers.</li>
                <li>🏆 <strong>Top 3</strong> — Pick 3 correct names out of 9.</li>
                <li>📋 <strong>Match Lineups</strong> — Guess the starters of famous matches.</li>
              </ul>

              <h3>Contact</h3>
              <p>
                Any suggestions or questions? Reach us at:{' '}
                <a href="mailto:p638599@gmail.com">p638599@gmail.com</a>
              </p>

              <p className="about-footer-note">
                EL kwayra © 2026 — text only, no player photos or club badges.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
