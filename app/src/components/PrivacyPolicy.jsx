export default function PrivacyPolicy({ open, lang, onClose }) {
  if (!open) return null;

  const isAr = lang === 'ar';

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box static-page-modal" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="modal-head">
          <h2 className="modal-title">
            {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
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
              <p className="static-page-updated">آخر تحديث: نوفمبر ٢٠٢٦</p>

              <h3>مرحباً بك في الكويرة</h3>
              <p>
                نحن في <strong>الكويرة</strong> نحترم خصوصيتك ونلتزم بحمايتها.
                هذه الصفحة توضح ما نجمعه من بيانات وكيف نستخدمها.
              </p>

              <h3>البيانات التي نجمعها</h3>
              <p>
                الموقع لا يجمع أي بيانات شخصية مباشرة. لكن الخدمات التالية قد
                تجمع بيانات بشكل تلقائي:
              </p>
              <ul>
                <li>
                  <strong>Google AdSense:</strong> يستخدم ملفات الكوكيز (Cookies)
                  لعرض إعلانات مخصصة بناءً على اهتماماتك وزياراتك السابقة.
                </li>
                <li>
                  <strong>بيانات الجلسة:</strong> يحفظ الموقع أسماء الفرق ونقاطهم
                  في ذاكرة المتصفح (localStorage) على جهازك فقط، ولا يُرسل أي شيء
                  لخوادمنا.
                </li>
              </ul>

              <h3>ملفات الكوكيز</h3>
              <p>
                يستخدم موقعنا ملفات الكوكيز عبر Google AdSense لتقديم إعلانات
                ملائمة. يمكنك إيقاف الكوكيز من إعدادات متصفحك في أي وقت.
                لمزيد من المعلومات، راجع{' '}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  سياسة خصوصية جوجل
                </a>
                .
              </p>

              <h3>مشاركة البيانات</h3>
              <p>
                لا نبيع أو نشارك أي بيانات شخصية مع أطراف ثالثة. الإعلانات
                المعروضة يديرها Google AdSense بشكل مستقل.
              </p>

              <h3>حقوقك</h3>
              <p>
                يحق لك في أي وقت مسح بيانات الجلسة المحفوظة على جهازك بحذف بيانات
                المتصفح (Clear Site Data).
              </p>

              <h3>التواصل معنا</h3>
              <p>
                لأي استفسار بخصوص الخصوصية، تواصل معنا على:{' '}
                <a href="mailto:p638599@gmail.com">p638599@gmail.com</a>
              </p>
            </>
          ) : (
            <>
              <p className="static-page-updated">Last updated: November 2026</p>

              <h3>Welcome to EL kwayra</h3>
              <p>
                At <strong>EL kwayra</strong>, we respect your privacy and are
                committed to protecting it. This page explains what data we collect
                and how we use it.
              </p>

              <h3>Data We Collect</h3>
              <p>
                The site does not collect any personal data directly. However, the
                following services may collect data automatically:
              </p>
              <ul>
                <li>
                  <strong>Google AdSense:</strong> Uses cookies to display
                  personalised ads based on your interests and browsing history.
                </li>
                <li>
                  <strong>Session data:</strong> The site saves team names and
                  scores in your browser's localStorage on your device only —
                  nothing is sent to our servers.
                </li>
              </ul>

              <h3>Cookies</h3>
              <p>
                Our site uses cookies through Google AdSense to serve relevant ads.
                You can disable cookies in your browser settings at any time. For
                more information, see{' '}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google's Privacy Policy
                </a>
                .
              </p>

              <h3>Data Sharing</h3>
              <p>
                We do not sell or share any personal data with third parties. The
                ads displayed are managed independently by Google AdSense.
              </p>

              <h3>Your Rights</h3>
              <p>
                You can clear session data stored on your device at any time by
                clearing your browser's site data.
              </p>

              <h3>Contact Us</h3>
              <p>
                For any privacy questions, contact us at:{' '}
                <a href="mailto:p638599@gmail.com">p638599@gmail.com</a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
