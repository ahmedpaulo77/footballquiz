import { useState } from 'react';
import TeamScoreboard from './TeamScoreboard.jsx';
import GulfToggle from './GulfToggle.jsx';
import { selectGulfPool } from '../lib/gulf.js';
import { pickQuestions, winnerIndex } from '../lib/points.js';
import {
  BONUS_ALL_CORRECT,
  DEFAULT_PICKS,
  correctPicks,
  gainForPicks,
  isPicksComplete,
  togglePick,
} from '../lib/top3.js';

function fill(template, values) {
  return String(template ?? '').replace(/\{(\w+)\}/g, (match, key) =>
    values[key] == null ? match : String(values[key]),
  );
}

export default function Top3Game({
  quiz,
  ui,
  teamNames,
  scores,
  onAddPoints,
  onEditTeams,
  onResetScores,
}) {
  const labels = ui.top3;

  const [gulfMode, setGulfMode] = useState(false);
  const pool = selectGulfPool(quiz.questions, gulfMode);
  const picksCount = quiz.picksCount ?? DEFAULT_PICKS;
  const rounds = Math.min(
    quiz.questionsPerGame ?? 8,
    pool.length,
  );

  const [round, setRound] = useState(0);
  const [questionIds, setQuestionIds] = useState(() =>
    pickQuestions(pool, rounds).map((question) => question.id),
  );
  const [picks, setPicks] = useState(() => [[], []]);
  const [activeTeam, setActiveTeam] = useState(0);
  const [firstLocked, setFirstLocked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [gains, setGains] = useState([0, 0]);
  const [finished, setFinished] = useState(false);

  const question =
    quiz.questions.find((item) => item.id === questionIds[round]) ?? null;
  const players = question?.players ?? [];
  const top = question?.top ?? [];

  const sudden = round >= rounds;
  const activePicks = picks[activeTeam] ?? [];
  const firstComplete = isPicksComplete(picks[0], picksCount);
  const activeComplete = isPicksComplete(activePicks, picksCount);
  const leader = winnerIndex(scores);

  const progress = rounds > 0 ? Math.min(100, ((round + 1) / rounds) * 100) : 0;

  const nextLabel =
    round + 1 >= rounds && leader !== null
      ? labels.showResult
      : round + 1 >= rounds
        ? labels.suddenNext
        : labels.nextQuestion;

  function toggle(index) {
    if (revealed || finished) return;

    setPicks((current) => {
      const next = [...current];
      next[activeTeam] = togglePick(current[activeTeam], index, picksCount);
      return next;
    });
  }

  function confirmFirst() {
    if (!firstComplete) return;
    setFirstLocked(true);
    setActiveTeam(1);
  }

  function backToFirst() {
    if (revealed || finished) return;
    setPicks((current) => [current[0], []]);
    setFirstLocked(false);
    setActiveTeam(0);
  }

  function revealAnswer() {
    if (revealed || finished || !firstComplete || !activeComplete) return;

    const nextGains = [
      gainForPicks(picks[0], top),
      gainForPicks(picks[1], top),
    ];

    setGains(nextGains);
    onAddPoints(0, nextGains[0]);
    onAddPoints(1, nextGains[1]);
    setRevealed(true);
  }

  function resetRoundState() {
    setPicks([[], []]);
    setActiveTeam(0);
    setFirstLocked(false);
    setRevealed(false);
    setGains([0, 0]);
  }

  function goNext() {
    if (!revealed) return;

    const nextRound = round + 1;

    if (nextRound < rounds) {
      setRound(nextRound);
      resetRoundState();
      return;
    }

    if (winnerIndex(scores) !== null) {
      setFinished(true);
      return;
    }

    const used = new Set(questionIds);
    const remainingPool = pool.filter((item) => !used.has(item.id));
    const [nextQuestion] = pickQuestions(
      remainingPool.length > 0 ? remainingPool : pool,
      1,
    );

    if (!nextQuestion) {
      setFinished(true);
      return;
    }

    setQuestionIds((current) => [...current, nextQuestion.id]);
    setRound(nextRound);
    resetRoundState();
  }

  function resetGame() {
    const nextQuestions = pickQuestions(pool, rounds);

    setRound(0);
    setQuestionIds(nextQuestions.map((item) => item.id));
    setFinished(false);
    resetRoundState();
  }

  /** بيبدّل بين أسئلة توب 3 العامة وأسئلة «الكرة الخليجية» ويبدأ جولة جديدة. */
  function toggleGulf() {
    const next = !gulfMode;
    const nextPool = selectGulfPool(quiz.questions, next);
    const nextQuestions = pickQuestions(
      nextPool,
      Math.min(quiz.questionsPerGame ?? 8, nextPool.length),
    );

    setGulfMode(next);
    setRound(0);
    setQuestionIds(nextQuestions.map((item) => item.id));
    setFinished(false);
    resetRoundState();
  }

  function requestReset() {
    const started =
      round > 0 || picks.some((teamPicks) => teamPicks.length > 0);

    if (!started) {
      resetGame();
      return;
    }

    if (typeof window !== 'undefined' && window.confirm(labels.resetConfirm)) {
      resetGame();
    }
  }

  return (
    <section className="top3-game" aria-label={labels.boardAria}>
      <GulfToggle ui={ui} active={gulfMode} onToggle={toggleGulf} />
      <TeamScoreboard
        names={teamNames}
        scores={scores}
        roles={[labels.teamOne, labels.teamTwo]}
        pointsLabel={labels.points}
        activeIndex={revealed || finished ? null : activeTeam}
        activeLabel={labels.turnLabel}
        editLabel={ui.teams.edit}
        onEdit={onEditTeams}
        resetLabel={ui.teams.resetScores}
        onReset={onResetScores}
      />

      {finished ? (
        <div className="risk-final">
          <span className="risk-final-emoji" aria-hidden="true">
            🏆
          </span>
          <h3 className="risk-final-title">
            {leader === null ? labels.tie : labels.winner}
          </h3>
          {leader === null ? null : (
            <p className="risk-final-name">{teamNames[leader]}</p>
          )}

          <div className="risk-final-scores">
            {[0, 1].map((index) => (
              <div key={index} className="risk-final-score">
                <span>{teamNames[index]}</span>
                <b>{scores[index]}</b>
              </div>
            ))}
          </div>

          <p className="risk-final-label">{labels.finalTitle}</p>

          <button type="button" className="primary-btn full" onClick={resetGame}>
            {labels.playAgain}
          </button>
        </div>
      ) : (
        <>
          <div className="points-header">
            <div className="points-round-row">
              <span className="points-round">
                {sudden
                  ? labels.suddenLabel
                  : fill(labels.roundLabel, { current: round + 1, total: rounds })}
              </span>
              <button type="button" className="risk-reset" onClick={requestReset}>
                {labels.reset}
              </button>
            </div>
            <div className="points-progress" aria-hidden="true">
              <span style={{ width: `${progress}%` }} />
            </div>
            {sudden ? <p className="points-sudden-note">{labels.suddenNote}</p> : null}
          </div>

          <div className="top3-question">
            <span className="top3-question-emoji" aria-hidden="true">
              🥉
            </span>
            <div className="top3-question-body">
              {question?.category ? (
                <span className="top3-category">{question.category}</span>
              ) : null}
              <p className="top3-question-text">{question?.question}</p>
            </div>
          </div>

          {revealed ? (
            <div className="points-legend">
              <span className="is-team-1">● {teamNames[0]}</span>
              <span className="is-team-2">● {teamNames[1]}</span>
              <span className="top3-correct-key">✓ {labels.correctBadge}</span>
            </div>
          ) : (
            <div className="top3-pick-head">
              <span className="top3-pick-team">
                {fill(labels.pickTeam, { team: teamNames[activeTeam] })}
              </span>
              <span className="top3-pick-count">
                {fill(labels.pickedCount, {
                  count: activePicks.length,
                  total: picksCount,
                })}
              </span>
            </div>
          )}

          {!revealed && activeTeam === 1 && firstLocked ? (
            <div className="points-locked-box">
              <span className="points-locked-title">
                {fill(labels.lockedTeam, { team: teamNames[0] })}
              </span>
              <span className="points-locked-note">{labels.lockedNote}</span>
              <button type="button" className="points-edit" onClick={backToFirst}>
                {labels.editFirst}
              </button>
            </div>
          ) : null}

          <div className="top3-grid" aria-label={labels.playersAria}>
            {players.map((player, index) => {
              const isTop = revealed && top.includes(index);
              const showFirstMarks = revealed || activeTeam === 0;
              const showSecondMarks = revealed || activeTeam === 1;
              const pickedByFirst = showFirstMarks && picks[0].includes(index);
              const pickedBySecond = showSecondMarks && picks[1].includes(index);
              const isPicked = !revealed && activePicks.includes(index);
              const atLimit =
                !revealed && activePicks.length >= picksCount && !isPicked;

              return (
                <button
                  key={`${player.name}-${index}`}
                  type="button"
                  className={`top3-player ${isPicked ? 'is-picked' : ''} ${
                    isTop ? 'is-correct' : ''
                  } ${pickedByFirst ? 'is-team-1' : ''} ${
                    pickedBySecond ? 'is-team-2' : ''
                  }`}
                  aria-pressed={revealed ? undefined : isPicked}
                  disabled={revealed || finished || atLimit}
                  onClick={() => toggle(index)}
                >
                  <span className="top3-player-name">{player.name}</span>

                  {revealed ? (
                    <span className="top3-player-stat">
                      {player.stat} {question?.unit}
                    </span>
                  ) : null}

                  <span className="top3-marks" aria-hidden="true">
                    {pickedByFirst ? <i className="top3-mark is-team-1" /> : null}
                    {pickedBySecond ? <i className="top3-mark is-team-2" /> : null}
                    {isTop ? <b className="top3-correct-mark">✓</b> : null}
                  </span>
                </button>
              );
            })}
          </div>

          {revealed ? (
            <>
              <div className="top3-result">
                <span className="top3-result-label">{labels.answerLabel}</span>

                <ol className="top3-answer">
                  {top.map((index) => (
                    <li key={index}>
                      <span>{players[index]?.name}</span>
                      <b>
                        {players[index]?.stat} {question?.unit}
                      </b>
                    </li>
                  ))}
                </ol>

                <div className="points-gains">
                  {[0, 1].map((index) => {
                    const hits = correctPicks(picks[index], top);
                    const full = top.length > 0 && hits === top.length;

                    return (
                      <div
                        key={index}
                        className={`points-gain is-team-${index + 1}`}
                      >
                        <span>{teamNames[index]}</span>
                        <div className="top3-gain-points">
                          <b>{fill(labels.gain, { points: gains[index] })}</b>
                          <small>
                            {full
                              ? fill(labels.hitsBonus, {
                                  hits,
                                  bonus: BONUS_ALL_CORRECT,
                                })
                              : fill(labels.hits, { hits })}
                          </small>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button type="button" className="primary-btn full" onClick={goNext}>
                {nextLabel}
              </button>
            </>
          ) : (
            <>
              {activeTeam === 0 ? (
                <button
                  type="button"
                  className="primary-btn full"
                  onClick={confirmFirst}
                  disabled={!firstComplete}
                >
                  {fill(labels.confirmFirst, { team: teamNames[0] })}
                </button>
              ) : (
                <button
                  type="button"
                  className="primary-btn full"
                  onClick={revealAnswer}
                  disabled={!activeComplete}
                >
                  {labels.reveal}
                </button>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}
