import { useCallback, useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import QuizSwitcher from './components/QuizSwitcher.jsx';
import ClueList from './components/ClueList.jsx';
import PathList from './components/PathList.jsx';
import AnswerReveal from './components/AnswerReveal.jsx';
import HowToPlay from './components/HowToPlay.jsx';
import HintInfo from './components/HintInfo.jsx';
import RiskGame from './components/RiskGame.jsx';
import PointsGame from './components/PointsGame.jsx';
import Top3Game from './components/Top3Game.jsx';
import LineupGame from './components/LineupGame.jsx';
import TeamSetup from './components/TeamSetup.jsx';
import TeamScoreboard from './components/TeamScoreboard.jsx';
import PrivacyPolicy from './components/PrivacyPolicy.jsx';
import AboutPage from './components/AboutPage.jsx';
import { getQuiz, getQuizzes, pickQuestion } from './lib/quizzes.js';
import { getUi } from './lib/i18n.js';
import { addTeamPoints, resolveTeamNames } from './lib/teams.js';
import { pointsForMatch } from './lib/lineups.js';
import {
  cleanupLegacyStorage,
  hasSeenHelp,
  hasTeamSetup,
  loadLang,
  loadScores,
  loadTeamNames,
  loadTheme,
  markHelpSeen,
  markTeamSetupSeen,
  saveLang,
  saveScores,
  saveTeamNames,
  saveTheme,
} from './lib/storage.js';

/** آخر كام سؤال نستبعدهم عشان ميتكررش نفس السؤال قريب. */
const RECENT_LIMIT = 10;

/** بيعوّض {placeholders} في نصوص الواجهة. */
function fill(template, values) {
  return String(template ?? '').replace(/\{(\w+)\}/g, (match, key) =>
    values[key] == null ? match : String(values[key]),
  );
}

/** الألعاب اللي بتدير أسئلتها بنفسها من غير اختيار سؤال واحد. */
const SELF_PACED_KINDS = new Set(['risk', 'points', 'top3', 'lineups']);

export default function App({ initialQuizId = 'who-am-i' }) {
  const [lang, setLang] = useState(() => loadLang());
  const [theme, setTheme] = useState(() => loadTheme());
  const [questionId, setQuestionId] = useState(() => {
    const initialQuiz = getQuiz(initialQuizId);
    return SELF_PACED_KINDS.has(initialQuiz.kind)
      ? null
      : pickQuestion(initialQuiz)?.id ?? null;
  });
  const [recent, setRecent] = useState({});
  const [revealed, setRevealed] = useState(false);
  const [teams, setTeams] = useState(() => loadTeamNames());
  const [scores, setScores] = useState(() => loadScores());
  const [questionAward, setQuestionAward] = useState(null);
  const [lineupAwards, setLineupAwards] = useState({});
  const [modal, setModal] = useState(() => {
    if (!hasSeenHelp()) return 'help';
    if (!hasTeamSetup()) return 'teams';
    return null;
  });

  const ui = getUi(lang);
  const teamNames = resolveTeamNames(teams, lang);
  const quizzes = getQuizzes(lang);
  const quiz = getQuiz(initialQuizId, lang);
  const isRisk = quiz.kind === 'risk';
  const isPoints = quiz.kind === 'points';
  const isTop3 = quiz.kind === 'top3';
  const isLineups = quiz.kind === 'lineups';
  const isSelfPaced = SELF_PACED_KINDS.has(quiz.kind);
  const question = isSelfPaced
    ? null
    : quiz.questions.find((item) => item.id === questionId) ?? quiz.questions[0];
  const tip = ui.tips[quiz.kind] ?? ui.tips.clues;

  /** اللعبة "بدأت" لو فيه نقاط أو سؤال اتكشف — يعني يستاهل confirm */
  const gameInProgress =
    scores.some((s) => s > 0) ||
    revealed ||
    Object.keys(lineupAwards).length > 0;

  useEffect(() => {
    cleanupLegacyStorage();
  }, []);

  useEffect(() => {
    saveScores(scores);
  }, [scores]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = ui.dir;
    document.title = `${quiz.title} — ${ui.brand}`;
    saveLang(lang);
  }, [lang, ui.brand, ui.dir, quiz.title]);

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
    setQuestionAward(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [quiz, question?.id, recent]);

  const toggleAnswer = useCallback(() => {
    setRevealed((current) => !current);
  }, []);

  const toggleLang = useCallback(() => {
    setLang((current) => (current === 'ar' ? 'en' : 'ar'));
  }, []);

  const addPoints = useCallback((teamIndex, delta) => {
    setScores((current) => addTeamPoints(current, teamIndex, delta));
  }, []);

  function awardQuestion(teamIndex) {
    if (!question || questionAward?.questionId === question.id) return;
    addPoints(teamIndex, 1);
    setQuestionAward({ questionId: question.id, team: teamIndex });
  }

  function undoQuestionAward() {
    if (!questionAward) return;
    addPoints(questionAward.team, -1);
    setQuestionAward(null);
  }

  function awardLineup(match, teamIndex) {
    if (!match || lineupAwards[match.id]) return;
    const points = pointsForMatch(match);
    setLineupAwards((current) => ({
      ...current,
      [match.id]: { team: teamIndex, points },
    }));
    addPoints(teamIndex, points);
  }

  function undoLineupAward(matchId) {
    const award = lineupAwards[matchId];
    if (!award) return;
    addPoints(award.team, -award.points);
    setLineupAwards((current) => {
      const next = { ...current };
      delete next[matchId];
      return next;
    });
  }

  function saveTeams(nextNames) {
    const resolved = resolveTeamNames(nextNames, lang);
    setTeams(resolved);
    saveTeamNames(resolved);
    markTeamSetupSeen();
    setModal(null);
  }

  function resetScores() {
    setScores([0, 0]);
    setQuestionAward(null);
    setLineupAwards({});
  }

  function closeHelp() {
    markHelpSeen();
    setModal(hasTeamSetup() ? null : 'teams');
  }

  function closeTeams() {
    markTeamSetupSeen();
    setModal(null);
  }

  return (
    <div className="app">
      <div className="field-decor" aria-hidden="true" />

      <Header
        theme={theme}
        lang={lang}
        title={ui.brand}
        ui={ui}
        onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
        onToggleLang={toggleLang}
        onOpenHelp={() => setModal('help')}
        onGoHome={gameInProgress ? true : null}
      />

      <QuizSwitcher
        quizzes={quizzes}
        activeId={quiz.id}
        ariaLabel={ui.quizNav}
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

        {isRisk ? (
          <RiskGame
            quiz={quiz}
            ui={ui}
            teamNames={teamNames}
            scores={scores}
            onAddPoints={addPoints}
            onEditTeams={() => setModal('teams')}
          />
        ) : isPoints ? (
          <PointsGame
            quiz={quiz}
            ui={ui}
            lang={lang}
            teamNames={teamNames}
            scores={scores}
            onAddPoints={addPoints}
            onEditTeams={() => setModal('teams')}
          />
        ) : isTop3 ? (
          <Top3Game
            quiz={quiz}
            ui={ui}
            teamNames={teamNames}
            scores={scores}
            onAddPoints={addPoints}
            onEditTeams={() => setModal('teams')}
          />
        ) : isLineups ? (
          <LineupGame
            quiz={quiz}
            ui={ui}
            teamNames={teamNames}
            scores={scores}
            awards={lineupAwards}
            onAward={awardLineup}
            onUndoAward={undoLineupAward}
            onEditTeams={() => setModal('teams')}
          />
        ) : (
          <>
            {quiz.kind === 'clues' ? (
              <button
                type="button"
                className="hint-info-btn"
                onClick={() => setModal('hint')}
              >
                <span aria-hidden="true">💡</span>
                {ui.hintInfo.button}
              </button>
            ) : null}

            <TeamScoreboard
              names={teamNames}
              scores={scores}
              roles={[ui.teams.teamOne, ui.teams.teamTwo]}
              pointsLabel={ui.teams.points}
              editLabel={ui.teams.edit}
              onEdit={() => setModal('teams')}
            />

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

            <div className="teams-award">
              <div className="teams-award-head">
                <b>{ui.teams.awardTitle}</b>
                <span>{ui.teams.awardHint}</span>
              </div>

              {questionAward?.questionId === question.id ? (
                <div className="teams-award-done">
                  <span>
                    {fill(ui.teams.awarded, {
                      team: teamNames[questionAward.team],
                    })}
                  </span>
                  <button
                    type="button"
                    className="points-edit"
                    onClick={undoQuestionAward}
                  >
                    {ui.teams.undo}
                  </button>
                </div>
              ) : (
                <div className="teams-award-actions">
                  {[0, 1].map((index) => (
                    <button
                      key={index}
                      type="button"
                      className={`teams-award-btn is-team-${index + 1}`}
                      onClick={() => awardQuestion(index)}
                    >
                      <span>{teamNames[index]}</span>
                      <b>+1</b>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="controls">
              <button type="button" className="primary-btn next-btn" onClick={nextQuestion}>
                <span aria-hidden="true">🎲</span>
                {quiz.nextLabel}
              </button>
            </div>

            <p className="controls-hint">{tip.hint}</p>
          </>
        )}
      </main>

      <footer className="site-footer">
        <p>{ui.footerTitle}</p>
        <div className="site-footer-links">
          <button
            type="button"
            className="site-footer-link"
            onClick={() => setModal('about')}
          >
            {lang === 'ar' ? 'عن الموقع' : 'About'}
          </button>
          <button
            type="button"
            className="site-footer-link"
            onClick={() => setModal('privacy')}
          >
            {lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
          </button>
        </div>
      </footer>

      <HowToPlay open={modal === 'help'} ui={ui} onClose={closeHelp} />

      <HintInfo
        open={modal === 'hint'}
        info={ui.hintInfo}
        onClose={() => setModal(null)}
      />

      <TeamSetup
        open={modal === 'teams'}
        names={teamNames}
        scores={scores}
        labels={ui.teams}
        onSave={saveTeams}
        onClose={closeTeams}
        onResetScores={resetScores}
      />

      <PrivacyPolicy
        open={modal === 'privacy'}
        lang={lang}
        onClose={() => setModal(null)}
      />

      <AboutPage
        open={modal === 'about'}
        lang={lang}
        onClose={() => setModal(null)}
      />
    </div>
  );
}
