import { useRef, useState } from 'react';
import Modal from './Modal.jsx';
import { findCell, isBoardComplete, scoreDelta, scoreLabel } from '../lib/risk.js';

const DEFAULT_NAMES = {
  ar: ['الفريق الأول', 'الفريق الثاني'],
  en: ['Team One', 'Team Two'],
};

/** بيعوّض {placeholders} في نصوص الواجهة. */
function fill(template, values) {
  return String(template ?? '').replace(/\{(\w+)\}/g, (match, key) =>
    values[key] == null ? match : String(values[key]),
  );
}

export default function RiskGame({ quiz, ui, lang }) {
  const labels = ui.risk;
  const defaults = DEFAULT_NAMES[lang] ?? DEFAULT_NAMES.ar;

  const [customNames, setCustomNames] = useState([null, null]);
  const [scores, setScores] = useState([0, 0]);
  const [turn, setTurn] = useState(0);
  const [used, setUsed] = useState(() => new Set());
  const [activeId, setActiveId] = useState(null);
  const [risk, setRisk] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState(null);
  const judgedRef = useRef(false);

  const active = activeId
    ? quiz.questions.find((question) => question.id === activeId) ?? null
    : null;
  const teamNames = customNames.map((name, index) =>
    name && name.trim() ? name : defaults[index],
  );

  const categories = quiz.categories ?? [];
  const values = quiz.values ?? [];
  const activeCategory = categories.find((category) => category.id === active?.category);
  const allDone = isBoardComplete(quiz.questions, used);
  const remaining = quiz.questions.length - used.size;

  function updateName(index, value) {
    setCustomNames((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
  }

  function openCell(cell) {
    if (!cell || used.has(cell.id)) return;

    judgedRef.current = false;
    setActiveId(cell.id);
    setRisk(false);
    setRevealed(false);
    setResult(null);
  }

  function closeQuestion() {
    if (result) {
      finishQuestion();
      return;
    }

    setActiveId(null);
    setRisk(false);
    setRevealed(false);
  }

  function finishQuestion() {
    judgedRef.current = false;
    setActiveId(null);
    setRisk(false);
    setRevealed(false);
    setResult(null);
    setTurn((current) => 1 - current);
  }

  function judge(correct) {
    if (!active || result || judgedRef.current) return;

    judgedRef.current = true;
    const delta = scoreDelta({ value: active.value, risk, correct });

    setScores((current) => {
      const next = [...current];
      next[turn] += delta;
      return next;
    });
    setUsed((current) => new Set(current).add(active.id));
    setResult({ correct, delta, team: turn, value: active.value, risk });
  }

  function resetGame() {
    judgedRef.current = false;
    setScores([0, 0]);
    setTurn(0);
    setUsed(new Set());
    setActiveId(null);
    setRisk(false);
    setRevealed(false);
    setResult(null);
  }

  function requestReset() {
    if (used.size === 0 && scores.every((score) => score === 0)) {
      resetGame();
      return;
    }

    if (typeof window !== 'undefined' && window.confirm(labels.resetConfirm)) {
      resetGame();
    }
  }

  const winnerIndex =
    scores[0] === scores[1] ? null : scores[0] > scores[1] ? 0 : 1;

  return (
    <section className="risk-game" aria-label={labels.boardAria}>
      <div className="risk-scoreboard">
        {[0, 1].map((index) => (
          <div
            key={index}
            className={`risk-team ${turn === index && !allDone ? 'is-active' : ''}`}
          >
            <div className="risk-team-top">
              <span className="risk-team-label">
                {index === 0 ? labels.teamOne : labels.teamTwo}
              </span>
              {turn === index && !allDone ? (
                <span className="risk-turn-badge">{labels.turnLabel}</span>
              ) : null}
            </div>

            <input
              className="risk-team-input"
              type="text"
              maxLength={24}
              value={customNames[index] ?? defaults[index]}
              onChange={(event) => updateName(index, event.target.value)}
              onBlur={() => {
                if (!customNames[index]?.trim()) updateName(index, null);
              }}
              aria-label={labels.teamAria}
            />

            <div className="risk-team-score">
              {scores[index]}
              <span>{labels.points}</span>
            </div>
          </div>
        ))}
      </div>

      {allDone ? (
        <div className="risk-final">
          <span className="risk-final-emoji" aria-hidden="true">
            🏆
          </span>
          <h3 className="risk-final-title">
            {winnerIndex === null ? labels.tie : labels.winner}
          </h3>
          {winnerIndex === null ? null : (
            <p className="risk-final-name">{teamNames[winnerIndex]}</p>
          )}

          <div className="risk-final-scores">
            {[0, 1].map((index) => (
              <div key={index} className="risk-final-score">
                <span>{teamNames[index]}</span>
                <b>{scores[index]}</b>
              </div>
            ))}
          </div>

          <p className="risk-final-label">{labels.finalScore}</p>

          <button type="button" className="primary-btn full" onClick={resetGame}>
            {labels.playAgain}
          </button>
        </div>
      ) : (
        <>
          <div className="risk-toolbar">
            <p className="risk-turn-text">
              {fill(labels.activeTeam, { team: teamNames[turn] })}
            </p>
            <button type="button" className="risk-reset" onClick={requestReset}>
              {labels.reset}
            </button>
          </div>

          <p className="risk-remaining">
            {fill(labels.remaining, { count: remaining })}
          </p>

          <div className="risk-board">
            {categories.map((category) => (
              <div className="risk-category" key={category.id}>
                <div className="risk-category-head">
                  <span className="risk-category-emoji" aria-hidden="true">
                    {category.emoji}
                  </span>
                  <h3 className="risk-category-title">{category.title}</h3>
                </div>

                <div className="risk-values">
                  {values.map((value) => {
                    const cell = findCell(quiz.questions, category.id, value);
                    if (!cell) return null;

                    const isUsed = used.has(cell.id);

                    return (
                      <button
                        key={cell.id}
                        type="button"
                        className={`risk-cell ${isUsed ? 'is-used' : ''}`}
                        disabled={isUsed}
                        onClick={() => openCell(cell)}
                        aria-label={fill(labels.cellAria, {
                          category: category.title,
                          value,
                        })}
                      >
                        {isUsed ? <span aria-hidden="true">✓</span> : value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal
        open={Boolean(active)}
        title={activeCategory ? `${activeCategory.emoji} ${activeCategory.title}` : labels.questionTitle}
        onClose={closeQuestion}
        closeLabel={labels.close}
        className="risk-modal"
      >
        {active ? (
          <div className="risk-question">
            <div className="risk-question-meta">
              <span className="risk-question-team">
                {fill(labels.activeTeam, { team: teamNames[result?.team ?? turn] })}
              </span>
              <span className="risk-question-value">
                {fill(labels.valueChip, { value: active.value })}
              </span>
            </div>

            <p className="risk-question-text">{active.question}</p>

            <div className={`risk-risk-box ${risk ? 'is-on' : ''}`}>
              <button
                type="button"
                className={`risk-toggle ${risk ? 'is-on' : ''}`}
                onClick={() => setRisk((current) => !current)}
                disabled={revealed || Boolean(result)}
                aria-pressed={risk}
              >
                <span aria-hidden="true">🎲</span>
                {risk ? labels.riskOn : labels.riskOff}
              </button>
              <p className="risk-risk-hint">
                {risk
                  ? fill(labels.riskHint, {
                      value: active.value,
                      double: active.value * 2,
                    })
                  : fill(labels.normalHint, { value: active.value })}
              </p>
            </div>

            {revealed ? (
              <div className="risk-answer">
                <span className="risk-answer-label">{labels.answerLabel}</span>
                <p className="risk-answer-text">{active.answer}</p>
                <button
                  type="button"
                  className="risk-hide-btn"
                  onClick={() => setRevealed(false)}
                  disabled={Boolean(result)}
                >
                  {labels.hide}
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="primary-btn full risk-reveal-btn"
                onClick={() => setRevealed(true)}
              >
                {labels.reveal}
              </button>
            )}

            {result ? (
              <div
                className={`risk-result ${result.correct ? 'is-correct' : 'is-wrong'}`}
              >
                <div className="risk-result-top">
                  <span className="risk-result-title">
                    {result.correct ? labels.resultCorrect : labels.resultWrong}
                  </span>
                  <span className="risk-result-delta">
                    {scoreLabel(result.delta)}
                  </span>
                </div>
                <p className="risk-result-team">{teamNames[result.team]}</p>
                {!result.correct && !result.risk ? (
                  <p className="risk-result-note">{labels.resultNormalWrong}</p>
                ) : null}
                <button type="button" className="primary-btn full" onClick={finishQuestion}>
                  {labels.continue}
                </button>
              </div>
            ) : (
              <div className="risk-judge">
                <button
                  type="button"
                  className="risk-judge-btn is-correct"
                  onClick={() => judge(true)}
                  disabled={!revealed}
                >
                  {labels.correct}
                </button>
                <button
                  type="button"
                  className="risk-judge-btn is-wrong"
                  onClick={() => judge(false)}
                  disabled={!revealed}
                >
                  {labels.wrong}
                </button>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </section>
  );
}
