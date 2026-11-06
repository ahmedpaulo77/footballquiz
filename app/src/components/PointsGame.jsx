import { useState } from 'react';
import TeamScoreboard from './TeamScoreboard.jsx';
import {
  DEFAULT_POINTS,
  DEFAULT_ROUNDS,
  SPLIT_PRESETS,
  adjustSplit,
  createSplit,
  isSplitComplete,
  normalizePreset,
  pickQuestions,
  remainingPoints,
  scoreForSplit,
  setSplitValue,
  splitTotal,
  winnerIndex,
} from '../lib/points.js';

const OPTION_LETTERS = {
  ar: ['أ', 'ب', 'ج', 'د'],
  en: ['A', 'B', 'C', 'D'],
};

function fill(template, values) {
  return String(template ?? '').replace(/\{(\w+)\}/g, (match, key) =>
    values[key] == null ? match : String(values[key]),
  );
}

export default function PointsGame({
  quiz,
  ui,
  lang,
  teamNames,
  scores,
  onAddPoints,
  onEditTeams,
}) {
  const labels = ui.points;
  const letters = OPTION_LETTERS[lang] ?? OPTION_LETTERS.ar;

  const pointsPerQuestion = quiz.pointsPerQuestion ?? DEFAULT_POINTS;
  const rounds = Math.min(
    quiz.questionsPerGame ?? DEFAULT_ROUNDS,
    quiz.questions.length,
  );

  const [round, setRound] = useState(0);
  const [questionIds, setQuestionIds] = useState(() =>
    pickQuestions(quiz.questions, rounds).map((question) => question.id),
  );
  const [splits, setSplits] = useState(() => [createSplit(), createSplit()]);
  const [activeTeam, setActiveTeam] = useState(0);
  const [firstLocked, setFirstLocked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [gains, setGains] = useState([0, 0]);
  const [finished, setFinished] = useState(false);

  const question =
    quiz.questions.find((item) => item.id === questionIds[round]) ?? null;
  const options = question?.options ?? [];
  const correctIndex = Number.isInteger(question?.correct) ? question.correct : -1;

  const sudden = round >= rounds;
  const activeSplit = splits[activeTeam] ?? createSplit();
  const remaining = remainingPoints(activeSplit, pointsPerQuestion);
  const firstSplitComplete = isSplitComplete(splits[0], pointsPerQuestion);
  const activeSplitComplete = isSplitComplete(activeSplit, pointsPerQuestion);
  const leader = winnerIndex(scores);

  const progress = rounds > 0 ? Math.min(100, ((round + 1) / rounds) * 100) : 0;

  const nextLabel =
    round + 1 >= rounds && leader !== null
      ? labels.showResult
      : round + 1 >= rounds
        ? labels.suddenNext
        : labels.nextQuestion;

  function changeSplit(index, delta) {
    if (revealed || finished) return;

    setSplits((current) => {
      const next = [...current];
      next[activeTeam] = adjustSplit(
        current[activeTeam],
        index,
        delta,
        pointsPerQuestion,
      );
      return next;
    });
  }

  function changeSplitValue(index, raw) {
    if (revealed || finished) return;

    const value = Number.parseInt(raw, 10);

    setSplits((current) => {
      const next = [...current];
      next[activeTeam] = setSplitValue(
        current[activeTeam],
        index,
        Number.isNaN(value) ? 0 : value,
        pointsPerQuestion,
      );
      return next;
    });
  }

  function applyPreset(values) {
    if (revealed || finished) return;

    const preset = normalizePreset(values, pointsPerQuestion);
    if (!preset) return;

    setSplits((current) => {
      const next = [...current];
      next[activeTeam] = preset;
      return next;
    });
  }

  function clearSplit() {
    if (revealed || finished) return;

    setSplits((current) => {
      const next = [...current];
      next[activeTeam] = createSplit();
      return next;
    });
  }

  function confirmFirst() {
    if (!firstSplitComplete) return;
    setFirstLocked(true);
    setActiveTeam(1);
  }

  function backToFirst() {
    if (revealed || finished) return;
    setSplits((current) => [current[0], createSplit()]);
    setFirstLocked(false);
    setActiveTeam(0);
  }

  function revealAnswer() {
    if (revealed || finished || !firstSplitComplete || !activeSplitComplete) return;

    const nextGains = [
      scoreForSplit(splits[0], correctIndex),
      scoreForSplit(splits[1], correctIndex),
    ];

    setGains(nextGains);
    onAddPoints(0, nextGains[0]);
    onAddPoints(1, nextGains[1]);
    setRevealed(true);
  }

  function resetRoundState() {
    setSplits([createSplit(), createSplit()]);
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
    const pool = quiz.questions.filter((item) => !used.has(item.id));
    const [nextQuestion] = pickQuestions(
      pool.length > 0 ? pool : quiz.questions,
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
    const nextQuestions = pickQuestions(quiz.questions, rounds);

    setRound(0);
    setQuestionIds(nextQuestions.map((item) => item.id));
    setFinished(false);
    resetRoundState();
  }

  function requestReset() {
    const started =
      round > 0 || splits.some((split) => splitTotal(split) > 0);

    if (!started) {
      resetGame();
      return;
    }

    if (typeof window !== 'undefined' && window.confirm(labels.resetConfirm)) {
      resetGame();
    }
  }

  return (
    <section className="points-game" aria-label={labels.boardAria}>
      <TeamScoreboard
        names={teamNames}
        scores={scores}
        roles={[labels.teamOne, labels.teamTwo]}
        pointsLabel={labels.points}
        activeIndex={revealed || finished ? null : activeTeam}
        activeLabel={labels.turnLabel}
        editLabel={ui.teams.edit}
        onEdit={onEditTeams}
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

          <div className="points-question">
            <span className="points-question-emoji" aria-hidden="true">
              💯
            </span>
            <p className="points-question-text">{question?.question}</p>
          </div>

          {revealed ? (
            <div className="points-legend">
              <span className="is-team-1">● {teamNames[0]}</span>
              <span className="is-team-2">● {teamNames[1]}</span>
            </div>
          ) : (
            <div className="points-split-head">
              <span className="points-split-team">
                {fill(labels.splitTeam, { team: teamNames[activeTeam] })}
              </span>
              <span className="points-split-hint">{labels.splitHint}</span>
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

          <div className="points-options" aria-label={labels.optionsAria}>
            {options.map((option, index) => {
              const isCorrect = revealed && index === correctIndex;
              const count = activeSplit[index] ?? 0;

              return (
                <div
                  key={index}
                  className={`points-option ${isCorrect ? 'is-correct' : ''}`}
                >
                  <div className="points-option-head">
                    <span className="points-letter">{letters[index]}</span>
                    <p className="points-option-text">{option}</p>
                  </div>

                  {revealed ? (
                    <div className="points-option-reveal">
                      <span className="points-team-count is-team-1">
                        {splits[0][index] ?? 0}
                      </span>
                      <span className="points-team-count is-team-2">
                        {splits[1][index] ?? 0}
                      </span>
                      {isCorrect ? (
                        <span className="points-correct-badge">
                          ✓ {labels.correctBadge}
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <div className="points-stepper">
                      <button
                        type="button"
                        className="points-step-btn"
                        onClick={() => changeSplit(index, -1)}
                        disabled={count === 0}
                        aria-label={fill(labels.removePoint, { option })}
                      >
                        −
                      </button>
                      <input
                        className="points-step-value"
                        type="number"
                        inputMode="numeric"
                        min="0"
                        max={count + remaining}
                        value={count}
                        onChange={(event) => changeSplitValue(index, event.target.value)}
                        onFocus={(event) => event.target.select()}
                        aria-label={fill(labels.pointsValue, { option })}
                      />
                      <button
                        type="button"
                        className="points-step-btn"
                        onClick={() => changeSplit(index, 1)}
                        disabled={remaining === 0}
                        aria-label={fill(labels.addPoint, { option })}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {revealed ? (
            <>
              <div className="points-result">
                <span className="points-result-label">{labels.answerLabel}</span>
                <p className="points-result-text">{options[correctIndex]}</p>

                <div className="points-gains">
                  {[0, 1].map((index) => (
                    <div
                      key={index}
                      className={`points-gain is-team-${index + 1}`}
                    >
                      <span>{teamNames[index]}</span>
                      <b>{fill(labels.gain, { points: gains[index] })}</b>
                    </div>
                  ))}
                </div>
              </div>

              <button type="button" className="primary-btn full" onClick={goNext}>
                {nextLabel}
              </button>
            </>
          ) : (
            <>
              <div className="points-remaining" aria-live="polite">
                {remaining === 0
                  ? labels.remainingNone
                  : fill(labels.remaining, { count: remaining })}
              </div>

              <div className="points-presets">
                <span className="points-presets-label">{labels.presetsLabel}</span>
                {SPLIT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className="points-preset"
                    onClick={() => applyPreset(preset.values)}
                  >
                    {preset.values.join('-')}
                  </button>
                ))}
                <button
                  type="button"
                  className="points-preset is-clear"
                  onClick={clearSplit}
                >
                  {labels.clear}
                </button>
              </div>

              {activeTeam === 0 ? (
                <button
                  type="button"
                  className="primary-btn full"
                  onClick={confirmFirst}
                  disabled={!firstSplitComplete}
                >
                  {fill(labels.confirmFirst, { team: teamNames[0] })}
                </button>
              ) : (
                <button
                  type="button"
                  className="primary-btn full"
                  onClick={revealAnswer}
                  disabled={!activeSplitComplete}
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
