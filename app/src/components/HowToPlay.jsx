import Modal from './Modal.jsx';

const EXAMPLE_CLUES = [
  {
    label: 'المحطة الأولى',
    text: 'بدأت مسيرتي الاحترافية سنة ٢٠٠٤ مع نادي في بلدي.',
  },
  {
    label: 'الزملاء والمسيرة',
    text: 'لعبت بعدها في أندية كبيرة، وأبرز زمايلي كانوا نجوم عالميين.',
  },
  {
    label: 'الهوية والإنجازات',
    text: 'أنا مهاجم، وكسبت كأس العالم، واسمي بيبدأ بحرف معروف.',
  },
];

export default function HowToPlay({ open, onClose }) {
  return (
    <Modal open={open} title="طريقة اللعب" onClose={onClose} className="help-modal">
      <p className="help-lead">
        اللعبة دي معمولة للمقدّم: واحد ماسك الموبايل أو اللابتوب، بيقرأ السؤال
        بصوت عالي، والناس بتخمن. <b>كل التلميحات ظاهرة</b> — مفيش محاولات ولا انتظار.
      </p>

      <div className="help-clues">
        {EXAMPLE_CLUES.map((clue, index) => (
          <div className="help-clue" key={clue.label}>
            <span className="clue-index" aria-hidden="true">
              {index + 1}
            </span>
            <div>
              <span className="clue-label">{clue.label}</span>
              <p className="clue-text">{clue.text}</p>
            </div>
          </div>
        ))}
      </div>

      <ul className="legend">
        <li>
          <span className="legend-dot correct" aria-hidden="true">
            🔒
          </span>
          <span>
            <b>الإجابة</b> — مخفية في بوكس تحت السؤال. اضغط عليه تظهر الإجابة، واضغط
            تاني تختفي.
          </span>
        </li>
        <li>
          <span className="legend-dot arrow" aria-hidden="true">
            🎲
          </span>
          <span>
            <b>سؤال تاني</b> — لو السؤال مش عاجبك أو خلص، دوس الزرار وهيجيبلك سؤال
            جديد على طول.
          </span>
        </li>
        <li>
          <span className="legend-dot close" aria-hidden="true">
            🧩
          </span>
          <span>
            <b>أكتر من لعبة</b> — من فوق تقدر تنقّل بين «من أنا؟» و«المسار» وأي لعبة
            تانية تتضاف.
          </span>
        </li>
        <li>
          <span className="legend-dot wrong" aria-hidden="true">
            📋
          </span>
          <span>
            <b>البيانات</b> — أندية وزملاء وبطولات نص بس، من غير صور لاعبين أو شعارات
            أندية.
          </span>
        </li>
      </ul>

      <div className="help-tip">
        💡 نصيحة للمقدّم: اقرأ الأول، ادّي فرصة للتخمين، وبعدين كمّل. الإجابة في آخر
        الصفحة عشان محدش يشوفها بالغلط.
      </div>

      <button type="button" className="primary-btn full" onClick={onClose}>
        فهمت، يلا نبدأ
      </button>
    </Modal>
  );
}
