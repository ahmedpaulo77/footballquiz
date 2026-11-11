/** صفحة كل لعبة — كل لعبة ليها URL مستقل عشان الزيارات والإعلانات. */
const QUIZ_PATHS = {
  'who-am-i': './who-am-i.html',
  paths: './paths.html',
  risk: './risk.html',
  'one-question': './one-question.html',
  'top-three': './top-three.html',
  lineups: './lineups.html',
};

/** لينكات اختيار اللعبة — بتظهر بس لو فيه أكتر من لعبة. */
export default function QuizSwitcher({ quizzes, activeId, ariaLabel }) {
  if (quizzes.length < 2) return null;

  return (
    <nav className="quiz-tabs" aria-label={ariaLabel}>
      {quizzes.map((quiz) => (
        <a
          key={quiz.id}
          href={QUIZ_PATHS[quiz.id] ?? './'}
          className={`quiz-tab ${quiz.id === activeId ? 'is-active' : ''}`}
          aria-current={quiz.id === activeId ? 'page' : undefined}
        >
          <span aria-hidden="true">{quiz.emoji}</span>
          {quiz.title}
        </a>
      ))}
    </nav>
  );
}
