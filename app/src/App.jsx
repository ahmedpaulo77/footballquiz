import { useCallback, useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import QuizSwitcher from './components/QuizSwitcher.jsx';
import ClueList from './components/ClueList.jsx';
import PathList from './components/PathList.jsx';
import AnswerReveal from './components/AnswerReveal.jsx';
import HowToPlay from './components/HowToPlay.jsx';
import { getQuiz, getQuizzes, pickQuestion } from './lib/quizzes.js';
import { getUi } from './lib/i18n.js';
import {
  cleanupLegacyStorage,
  hasSeenHelp,
  loadLang,
  loadQuizId,
  loadTheme,
  markHelpSeen,
  saveLang,
  saveQuizId,
  saveTheme,
} from './lib/storage.js';

/** آخر كام سؤال نستبعدهم عشان ميتكررش نفس السؤال قريب. */
const RECENT_LIMIT = 10;

export default function App() {
  const [lang, setLang] = useState(() => loadLang());
  const [theme, setTheme] = useState(() => loadTheme());
  const [quizId, setQuizId] = useState(() => getQuiz(loadQuizId()).id);
  const [questionId, setQuestionId] = useState(
    () => pickQuestion(getQuiz(quizId))?.id ?? null,
  );
  const [recent, setRecent] = useState({});
  const [revealed, setRevealed] = useState(false);
  const [modal, setModal] = useState(() => (hasSeenHelp() ? null : 'help'));

  const ui = getUi(lang);
  const quizzes = getQuizzes(lang);
  const quiz = getQuiz(quizId, lang);
  const question =
    quiz.questions.find((item) => item.id === questionId) ?? quiz.questions[0];
  const tip = ui.tips[quiz.kind] ?? ui.tips.clues;

  useEffect(() => {
    cleanupLegacyStorage();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = ui.dir;
    document.title = lang === 'ar' ? 'من أنا؟ — لعبة تلميحات كورة' : 'Who Am I? — Football Quiz';
    saveLang(lang);
  }, [lang, ui.dir]);

  const nextQuestion = useCallback(() => {
    const used = recent[quiz.id] ?? [];
    const excludeIds = [...used, question?.id].filter(Boolean);
    const next = pickQuestion(quiz, { excludeIds });

    setQuestionId(next?.id ?? null);
    setRecent((current) => ({
      ...current,
      [quiz.id]: excludeIds.slice(-RECENT_LIMIT),
    }));
    setRevealed(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [quiz, question?.id, recent]);

  const chooseQuiz = useCallback(
    (nextId) => {
      if (nextId === quiz.id) return;

      const nextQuiz = getQuiz(nextId, lang);
      setQuizId(nextQuiz.id);
      setQuestionId(pickQuestion(nextQuiz)?.id ?? null);
      setRevealed(false);
      saveQuizId(nextQuiz.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [quiz.id, lang],
  );

  const toggleAnswer = useCallback(() => {
    setRevealed((current) => !current);
  }, []);

  const toggleLang = useCallback(() => {
    setLang((current) => (current === 'ar' ? 'en' : 'ar'));
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
        lang={lang}
        title={ui.brand}
        subtitle={quiz.subtitle}
        ui={ui}
        onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
        onToggleLang={toggleLang}
        onOpenHelp={() => setModal('help')}
      />

      <QuizSwitcher
        quizzes={quizzes}
        activeId={quiz.id}
        ariaLabel={ui.quizNav}
        onChange={chooseQuiz}
      />

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
          <PathList clubs={question.clubs} loans={question.loans} ui={ui} />
        ) : (
          <ClueList clues={question.clues} ariaLabel={ui.cluesAria} />
        )}

        <AnswerReveal
          answer={question.answer}
          meta={question.meta}
          answerLabel={quiz.answerLabel}
          ui={ui}
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
        <p>{ui.footerData}</p>
        <p>{ui.footerTitle}</p>
      </footer>

      <HowToPlay open={modal === 'help'} ui={ui} onClose={closeHelp} />
    </div>
  );
}
