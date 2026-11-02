/**
 * بوكس الإجابة — مقفول افتراضيًا، والضغط عليه بيوري الإجابة،
 * والضغط تاني بيخفيها. المقدّم هو اللي بيتحكم فيه.
 */
export default function AnswerReveal({
  answer,
  meta = [],
  answerLabel,
  ui,
  revealed,
  onToggle,
}) {
  return (
    <button
      type="button"
      className={`answer-card ${revealed ? 'is-revealed' : ''}`}
      onClick={onToggle}
      aria-expanded={revealed}
      title={revealed ? ui.answerTitleHide : ui.answerTitleShow}
    >
      <span className="answer-head">
        <span className="answer-eyebrow">
          {revealed ? ui.answerShown : ui.answerHidden}
        </span>
        <span className="answer-toggle">{revealed ? ui.hide : ui.show}</span>
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
            <span className="answer-name">
              {`${ui.answerPlaceholder}${answerLabel ? ` — ${answerLabel}` : ''}`}
            </span>
            <span className="answer-meta">{ui.answerHint}</span>
          </span>
        </span>
      )}
    </button>
  );
}
