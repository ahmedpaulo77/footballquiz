import { useRef, useState } from 'react';
import Modal from './Modal.jsx';
import TeamScoreboard from './TeamScoreboard.jsx';
import {
  findCell,
  isBoardComplete,
  pickCategories,
  scoreDelta,
  scoreLabel,
  swapCategory,
} from '../lib/risk.js';

/** عدد الفئات اللي بتظهر على اللوحة في اللعبة الواحدة. */
const BOARD_CATEGORIES = 4;

/** بيعوّض {placeholders} في نصوص الواجهة. */
function fill(template, values) {
  return String(template ?? '').replace(/\{(\w+)\}/g, (match, key) =>
    values[key] == null ? match : String(values[key]),
  );
}

export default function RiskGame({
  quiz,
  ui,
  teamNames,
  scores,
  onAddPoints,
  onEditTeams,
}) {
  const labels = ui.risk;

  const [turn, setTurn] = useState(0);
  const [used, setUsed] = useState(() => new Set());
  const [categoryIds, setCategoryIds] = useState(() =>
    pickCategories(quiz.categories ?? [], BOARD_CATEGORIES).map(
      (category) => category.id,
    ),
  );
  const [activeId, setActiveId] = useState(null);
  const [pickedId, setPickedId] = useState(null);
  const [doubleId, setDoubleId] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState(null);
  const judgedRef = useRef(false);

  const active = activeId
    ? quiz.questions.find((question) => question.id === activeId) ?? null
    : null;

  const categories = quiz.categories ?? [];
  const values = quiz.values ?? [];
  const boardCategories = categoryIds
    .map((id) => categories.find((category) => category.id === id))
    .filter(Boolean);
  const boardQuestions = quiz.questions.filter((question) =>
    categoryIds.includes(question.category),
  );
  const activeCategory = categories.find((category) => category.id === active?.category);
  const allDone = isBoardComplete(boardQuestions, used);
  const remaining = boardQuestions.filter((question) => !used.has(question.id)).length;

  const picking = doubleId === null;
  const pickedCell = pickedId
    ? quiz.questions.find((question) => question.id === pickedId) ?? null
    : null;
  const pickedCategory = categories.find(
    (category) => category.id === pickedCell?.category,
  );
  const activeIsDouble = Boolean(active) && active.id === doubleId;

  function pickDouble(cell) {
    if (!cell || !picking) return;
    setPickedId(cell.id);
  }

  function swapBoardCategory(categoryId) {
    if (!picking) return;

    const next = swapCategory(categories, categoryIds);
    if (!next) return;

    setCategoryIds((current) =>
      current.map((id) => (id === categoryId ? next.id : id)),
    );

    if (pickedCell && pickedCell.category === categoryId) {
      setPickedId(null);
    }
  }

  function startGame() {
    if (!pickedId) return;
    setDoubleId(pickedId);
    setPickedId(null);
    setTurn(0);
  }

  function openCell(cell) {
    if (!cell || picking || used.has(cell.id)) return;

    judgedRef.current = false;
    setActiveId(cell.id);
    setRevealed(false);
    setResult(null);
  }

  function closeQuestion() {
    if (result) {
      finishQuestion();
      return;
    }

    setActiveId(null);
    setRevealed(false);
  }

  function finishQuestion() {
    judgedRef.current = false;
    setActiveId(null);
    setRevealed(false);
    setResult(null);
    setTurn((current) => 1 - current);
  }

  function judge(correct) {
    if (!active || result || judgedRef.current) return;

    judgedRef.current = true;
    const double = active.id === doubleId;
    const delta = scoreDelta({ value: active.value, double, correct });

    onAddPoints(turn, delta);
    setUsed((current) => new Set(current).add(active.id));
    setResult({ correct, delta, team: turn, value: active.value, double });
  }

  function resetGame() {
    judgedRef.current = false;
    setTurn(0);
    setUsed(new Set());
    setCategoryIds(
      pickCategories(categories, BOARD_CATEGORIES).map((category) => category.id),
    );
    setActiveId(null);
    setPickedId(null);
    setDoubleId(null);
    setRevealed(false);
    setResult(null);
  }

  function requestReset() {
    if (picking || used.size === 0) {
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
      <TeamScoreboard
        names={teamNames}
        scores={scores}
        roles={[labels.teamOne, labels.teamTwo]}
        pointsLabel={labels.points}
        activeIndex={allDone || picking ? null : turn}
        activeLabel={labels.turnLabel}
        editLabel={ui.teams.edit}
        onEdit={onEditTeams}
      />

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
          {picking ? (
            <div className="risk-pick">
              <span className="risk-pick-emoji" aria-hidden="true">
                🎲
              </span>
              <h3 className="risk-pick-title">{labels.doublePickTitle}</h3>
              <p className="risk-pick-text">
                {fill(labels.doublePickText, { team: teamNames[0] })}
              </p>

              {pickedCell ? (
                <p className="risk-pick-selected">
                  {fill(labels.doubleSelected, {
                    category: pickedCategory?.title,
                    value: pickedCell.value,
                  })}
                </p>
              ) : (
                <p className="risk-pick-selected is-empty">{labels.chooseCell}</p>
              )}

              <p className="risk-pick-hint">{labels.doublePickHint}</p>

              <button
                type="button"
                className="primary-btn full"
                onClick={startGame}
                disabled={!pickedCell}
              >
                {labels.doubleStart}
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
            </>
          )}

          <div className="risk-board">
            {boardCategories.map((category) => (
              <div className="risk-category" key={category.id}>
                <div className="risk-category-head">
                  <span className="risk-category-emoji" aria-hidden="true">
                    {category.emoji}
                  </span>
                  <h3 className="risk-category-title">{category.title}</h3>
                  {picking ? (
                    <button
                      type="button"
                      className="risk-swap"
                      onClick={() => swapBoardCategory(category.id)}
                      aria-label={fill(labels.swapAria, {
                        category: category.title,
                      })}
                      title={labels.swapHint}
                    >
                      <span aria-hidden="true">⇄</span>
                      {labels.swap}
                    </button>
                  ) : null}
                </div>

                <div className="risk-values">
                  {values.map((value) => {
                    const cell = findCell(quiz.questions, category.id, value);
                    if (!cell) return null;

                    const isUsed = used.has(cell.id);
                    const isDouble = cell.id === doubleId;
                    const isPicked = picking && cell.id === pickedId;
                    const showDouble = isDouble || isPicked;

                    return (
                      <button
                        key={cell.id}
                        type="button"
                        className={[
                          'risk-cell',
                          isUsed ? 'is-used' : '',
                          isDouble ? 'is-double' : '',
                          isPicked ? 'is-picked' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        disabled={isUsed}
                        onClick={() =>
                          picking ? pickDouble(cell) : openCell(cell)
                        }
                        aria-label={`${fill(labels.cellAria, {
                          category: category.title,
                          value,
                        })}${showDouble ? ` — ${labels.doubleChip}` : ''}`}
                        aria-pressed={picking ? isPicked : undefined}
                      >
                        {isUsed ? (
                          <span aria-hidden="true">✓</span>
                        ) : (
                          <>
                            <span className="risk-cell-value">{value}</span>
                            {showDouble ? (
                              <span className="risk-cell-double" aria-hidden="true">
                                {labels.doubleBadge}
                              </span>
                            ) : null}
                          </>
                        )}
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
              <span className="risk-question-chips">
                {activeIsDouble ? (
                  <span className="risk-question-double">{labels.doubleChip}</span>
                ) : null}
                <span className="risk-question-value">
                  {fill(labels.valueChip, { value: active.value })}
                </span>
              </span>
            </div>

            <p className="risk-question-text">{active.question}</p>

            <div className={`risk-hint-box ${activeIsDouble ? 'is-double' : ''}`}>
              <span className="risk-hint-tag">
                {activeIsDouble ? labels.doubleChip : labels.normalChip}
              </span>
              <p className="risk-hint-text">
                {activeIsDouble
                  ? fill(labels.doubleHint, {
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
                {result.correct && result.double ? (
                  <p className="risk-result-note is-double">{labels.resultDouble}</p>
                ) : null}
                {!result.correct ? (
                  <p className="risk-result-note">{labels.resultWrongNote}</p>
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
