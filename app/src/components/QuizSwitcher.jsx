/** أزرار اختيار اللعبة — بتظهر بس لو فيه أكتر من لعبة. */
export default function QuizSwitcher({ quizzes, activeId, ariaLabel, onChange }) {
  if (quizzes.length < 2) return null;

  return (
    <nav className="quiz-tabs" aria-label={ariaLabel}>
      {quizzes.map((quiz) => (
        <button
          key={quiz.id}
          type="button"
          className={`quiz-tab ${quiz.id === activeId ? 'is-active' : ''}`}
          aria-pressed={quiz.id === activeId}
          onClick={() => onChange(quiz.id)}
        >
          <span aria-hidden="true">{quiz.emoji}</span>
          {quiz.title}
        </button>
      ))}
    </nav>
  );
}
