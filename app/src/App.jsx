import { useCallback, useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import QuizSwitcher from './components/QuizSwitcher.jsx';
import ClueList from './components/ClueList.jsx';
import PathList from './components/PathList.jsx';
import AnswerReveal from './components/AnswerReveal.jsx';
import HowToPlay from './components/HowToPlay.jsx';
import { QUIZZES, getQuiz, pickQuestion } from './lib/quizzes.js';
import {
  cleanupLegacyStorage,
  hasSeenHelp,
  loadQuizId,
  loadTheme,
  markHelpSeen,
  saveQuizId,
  saveTheme,
} from './lib/storage.js';

/** آخر كام سؤال نستبعدهم عشان ميتكررش نفس السؤال قريب. */
const RECENT_LIMIT = 10;

const TIPS = {
  clues: {
    title: 'اقرأ التلميحات بالترتيب',
    text: 'سيب الناس تخمّن… الإجابة مخفية تحت، تفتحها بس لما تحتاجها.',
    hint: 'سؤال جديد بتلميحاته على طول — من غير تحدي يومي ولا محاولات.',
  },
  path: {
    title: 'الأندية قدام الجميع',
    text: 'ده مسار اللاعب بالترتيب… خليهم يخمنوا مين صاحب المسار، والإجابة مخفية تحت.',
    hint: 'المسار من اليمين للشمال بالترتيب الزمني — و«إعارة» معناها اللاعب كان معار.',
  },
};

export default function App() {
  const [theme, setTheme] = useState(() => loadTheme());
  const [quizId, setQuizId] = useState(() => getQuiz(loadQuizId()).id);
  const [question, setQuestion] = useState(() => pickQuestion(getQuiz(quizId)));
  const [recent, setRecent] = useState({});
  const [revealed, setRevealed] = useState(false);
  const [modal, setModal] = useState(() => (hasSeenHelp() ? null : 'help'));

  const quiz = getQuiz(quizId);
  const tip = TIPS[quiz.kind] ?? TIPS.clues;

  useEffect(() => {
    cleanupLegacyStorage();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    saveTheme(theme);
  }, [theme]);

  const nextQuestion = useCallback(() => {
    const used = recent[quiz.id] ?? [];
    const excludeIds = [...used, question.id];

    setQuestion(pickQuestion(quiz, { excludeIds }));
    setRecent((current) => ({
      ...current,
      [quiz.id]: excludeIds.slice(-RECENT_LIMIT),
    }));
    setRevealed(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [quiz, question.id, recent]);

  const chooseQuiz = useCallback(
    (nextId) => {
      if (nextId === quiz.id) return;

      const nextQuiz = getQuiz(nextId);
      setQuizId(nextQuiz.id);
      setQuestion(pickQuestion(nextQuiz));
      setRevealed(false);
      saveQuizId(nextQuiz.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [quiz.id],
  );

  const toggleAnswer = useCallback(() => {
    setRevealed((current) => !current);
  }, []);

  function closeHelp() {
    markHelpSeen();
    setModal(null);
  }

  return (
    <div className="app">
      <div className="field-decor" aria-hidden="true">
        <span className="field-circle" />
        <span className="field-line" />
      </div>

      <Header
        theme={theme}
        subtitle={quiz.subtitle}
        onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
        onOpenHelp={() => setModal('help')}
      />

      <QuizSwitcher quizzes={QUIZZES} activeId={quiz.id} onChange={chooseQuiz} />

      <main className="stage">
        <div className="host-tip">
          <span className="host-tip-icon" aria-hidden="true">
            🎤
          </span>
          <div className="host-tip-text">
            <b>{tip.title}</b>
            <span>{tip.text}</span>
          </div>
        </div>

        {quiz.kind === 'path' ? (
          <PathList clubs={question.clubs} loans={question.loans} />
        ) : (
          <ClueList clues={question.clues} />
        )}

        <AnswerReveal
          answer={question.answer}
          meta={question.meta}
          placeholder={`اضغط لعرض ${quiz.answerLabel}`}
          revealed={revealed}
          onToggle={toggleAnswer}
        />

        <div className="controls">
          <button type="button" className="primary-btn next-btn" onClick={nextQuestion}>
            <span aria-hidden="true">🎲</span>
            {quiz.nextLabel}
          </button>
        </div>

        <p className="controls-hint">{tip.hint}</p>
      </main>

      <footer className="site-footer">
        <p>بيانات نصية فقط — بدون صور أو شعارات أندية.</p>
        <p>من أنا؟ © 2026</p>
      </footer>

      <HowToPlay open={modal === 'help'} onClose={closeHelp} />
    </div>
  );
}
