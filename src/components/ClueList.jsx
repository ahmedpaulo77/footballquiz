/**
 * تلميحات اللاعب — كلها ظاهرة مع بعض عشان المقدّم يقرأها بالترتيب.
 */
export default function ClueList({ clues }) {
  return (
    <section className="clue-list" aria-label="تلميحات اللاعب">
      {clues.map((clue, index) => (
        <article key={clue.id} className="clue">
          <span className="clue-index" aria-hidden="true">
            {index + 1}
          </span>

          <div className="clue-body">
            <span className="clue-label">{clue.label}</span>
            <p className="clue-text">{clue.text}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
