export default function TeamScoreboard({
  names,
  scores,
  roles,
  pointsLabel,
  activeIndex = null,
  activeLabel = '',
  editLabel,
  onEdit,
  resetLabel,
  onReset,
}) {
  return (
    <div className="risk-scoreboard">
      {[0, 1].map((index) => (
        <div
          key={index}
          className={`risk-team ${activeIndex === index ? 'is-active' : ''}`}
        >
          <div className="risk-team-top">
            <span className="risk-team-label">{roles?.[index]}</span>
            {activeIndex === index && activeLabel ? (
              <span className="risk-turn-badge">{activeLabel}</span>
            ) : null}
            {onEdit ? (
              <button
                type="button"
                className="risk-team-edit"
                onClick={onEdit}
                aria-label={editLabel}
                title={editLabel}
              >
                ✎
              </button>
            ) : null}
          </div>

          <span className="risk-team-name">{names?.[index]}</span>

          <div className="risk-team-score">
            {scores?.[index] ?? 0}
            <span>{pointsLabel}</span>
          </div>
        </div>
      ))}

      {onReset ? (
        <button type="button" className="risk-score-reset" onClick={onReset}>
          <span aria-hidden="true">↺</span>
          {resetLabel}
        </button>
      ) : null}
    </div>
  );
}
