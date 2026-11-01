/**
 * بوكس الإجابة — مقفول افتراضيًا، والضغط عليه بيوري الإجابة،
 * والضغط تاني بيخفيها. المقدّم هو اللي بيتحكم فيه.
 */
export default function AnswerReveal({
  answer,
  meta = [],
  placeholder = 'اضغط لعرض الإجابة',
  revealed,
  onToggle,
}) {
  return (
    <button
      type="button"
      className={`answer-card ${revealed ? 'is-revealed' : ''}`}
      onClick={onToggle}
      aria-expanded={revealed}
      title={revealed ? 'اضغط لإخفاء الإجابة' : 'اضغط لعرض الإجابة'}
    >
      <span className="answer-head">
        <span className="answer-eyebrow">{revealed ? 'الإجابة' : 'الإجابة مخفية'}</span>
        <span className="answer-toggle">{revealed ? 'إخفاء' : 'اعرض'}</span>
      </span>

      {revealed ? (
        <span className="answer-body">
          <span className="answer-text">
            <span className="answer-name" dir="auto">
              {answer}
            </span>
            {meta.map((line) => (
              <span className="answer-meta" key={line} dir="auto">
                {line}
              </span>
            ))}
          </span>
        </span>
      ) : (
        <span className="answer-body">
          <span className="answer-lock" aria-hidden="true">
            🔒
          </span>
          <span className="answer-text">
            <span className="answer-name">{placeholder}</span>
            <span className="answer-meta">واضغط تاني عشان تخفيها</span>
          </span>
        </span>
      )}
    </button>
  );
}
