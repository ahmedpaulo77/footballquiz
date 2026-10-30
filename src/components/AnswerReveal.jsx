import Avatar from './Avatar.jsx';

/**
 * بوكس الإجابة — مغلق افتراضيًا، والضغط عليه بيوري اسم اللاعب،
 * والضغط تاني بيخفيه. المقدّم هو اللي بيتحكم فيه.
 */
export default function AnswerReveal({ player, revealed, onToggle }) {
  return (
    <button
      type="button"
      className={`answer-card ${revealed ? 'is-revealed' : ''}`}
      onClick={onToggle}
      aria-expanded={revealed}
      title={revealed ? 'اضغط لإخفاء الإجابة' : 'اضغط لعرض الإجابة'}
    >
      <span className="answer-head">
        <span className="answer-eyebrow">
          {revealed ? 'الإجابة' : 'الإجابة مخفية'}
        </span>
        <span className="answer-toggle">
          {revealed ? 'إخفاء 🙈' : 'اعرض 👁️'}
        </span>
      </span>

      {revealed ? (
        <span className="answer-body">
          <Avatar name={player.name} size={48} />
          <span className="answer-text">
            <span className="answer-name">{player.name}</span>
            <span className="answer-meta">
              {player.nationality} · {player.club}
            </span>
            <span className="answer-sub">
              {player.position} · {player.league} · {player.age} سنة
            </span>
          </span>
        </span>
      ) : (
        <span className="answer-body">
          <span className="answer-lock" aria-hidden="true">
            🔒
          </span>
          <span className="answer-text">
            <span className="answer-name">اضغط لعرض اسم اللاعب</span>
            <span className="answer-meta">واضغط تاني عشان تخفيه</span>
          </span>
        </span>
      )}
    </button>
  );
}
