/**
 * تلميحات اللاعب — كلها ظاهرة مع بعض عشان المقدّم يقرأها بالترتيب.
 */
export default function ClueList({ clues, ariaLabel }) {
  return (
    <section className="clue-list" aria-label={ariaLabel}>
      {clues.map((clue, index) => (
        <article key={clue.id} className="clue">
          <span className="clue-index" aria-hidden="true">
            {index + 1}
          </span>

          <div className="clue-body">
            {clue.label ? <span className="clue-label">{clue.label}</span> : null}
            <p className="clue-text">{clue.text}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
