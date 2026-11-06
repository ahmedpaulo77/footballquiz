import { useState } from 'react';
import Modal from './Modal.jsx';
import TeamScoreboard from './TeamScoreboard.jsx';
import { pointsForMatch } from '../lib/lineups.js';

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const GROUPS = ['GK', 'DF', 'MF', 'FW'];

function fill(template, values) {
  return String(template ?? '').replace(/\{(\w+)\}/g, (match, key) =>
    values[key] == null ? match : String(values[key]),
  );
}

function decidedText(match, labels) {
  if (!match) return '';
  if (match.decidedBy === 'penalties') {
    return fill(labels.penalties, { score: match.shootout ?? '' });
  }
  if (match.decidedBy === 'extra-time') return labels.extraTime;
  if (match.decidedBy === 'golden-goal') return labels.goldenGoal;
  return '';
}

function LineupSide({ team, players, labels, side }) {
  return (
    <section className={`lineup-side is-${side}`} aria-label={team}>
      <header className="lineup-side-head">
        <h3>{team}</h3>
        <span className="lineup-side-count">
          {fill(labels.playersCount, { count: players.length })}
        </span>
      </header>

      <div className="lineup-groups">
        {GROUPS.map((group) => {
          const list = players.filter((player) => player.group === group);
          if (list.length === 0) return null;

          return (
            <div className="lineup-group" key={group}>
              <h4 className="lineup-group-title">
                <span className="lineup-group-tag">{labels.groups[group].tag}</span>
                <span>{labels.groups[group].title}</span>
              </h4>

              <ul className="lineup-list">
                {list.map((player) => (
                  <li className="lineup-player" key={player.id}>
                    <span className="lineup-pos">{player.pos || labels.groups[group].tag}</span>
                    <span className="lineup-name">{player.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function LineupGame({
  quiz,
  ui,
  teamNames,
  scores,
  awards,
  onAward,
  onUndoAward,
  onEditTeams,
}) {
  const labels = ui.lineups;
  const matches = quiz.matches ?? [];

  const [difficulty, setDifficulty] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  const filtered =
    difficulty === 'all'
      ? matches
      : matches.filter((match) => match.difficulty === difficulty);

  const selected = matches.find((match) => match.id === selectedId) ?? null;
  const award = selected ? awards?.[selected.id] ?? null : null;

  function openRandom() {
    if (filtered.length === 0) return;
    const match = filtered[Math.floor(Math.random() * filtered.length)];
    setSelectedId(match.id);
  }

  return (
    <section className="lineup-game" aria-label={labels.boardAria}>
      <TeamScoreboard
        names={teamNames}
        scores={scores}
        roles={[ui.teams.teamOne, ui.teams.teamTwo]}
        pointsLabel={ui.teams.points}
        editLabel={ui.teams.edit}
        onEdit={onEditTeams}
      />

      <div className="lineup-toolbar">
        <div className="lineup-filters" role="group" aria-label={labels.filterAria}>
          <button
            type="button"
            className={`lineup-filter ${difficulty === 'all' ? 'is-active' : ''}`}
            aria-pressed={difficulty === 'all'}
            onClick={() => setDifficulty('all')}
          >
            {labels.all}
          </button>

          {DIFFICULTIES.map((level) => (
            <button
              key={level}
              type="button"
              className={`lineup-filter is-${level} ${
                difficulty === level ? 'is-active' : ''
              }`}
              aria-pressed={difficulty === level}
              onClick={() => setDifficulty(level)}
            >
              {labels.difficulty[level]}
            </button>
          ))}
        </div>

        <button type="button" className="lineup-random" onClick={openRandom}>
          <span aria-hidden="true">🎲</span>
          {labels.random}
        </button>
      </div>

      <p className="lineup-count" aria-live="polite">
        {fill(labels.matchCount, { count: filtered.length })}
      </p>

      {filtered.length === 0 ? (
        <p className="lineup-empty">{labels.empty}</p>
      ) : (
        <div className="lineup-grid">
          {filtered.map((match) => {
            const note = decidedText(match, labels);

            return (
              <button
                key={match.id}
                type="button"
                className="lineup-card"
                aria-label={fill(labels.matchAria, {
                  home: match.home,
                  away: match.away,
                  year: match.year,
                })}
                onClick={() => setSelectedId(match.id)}
              >
                <span className="lineup-card-top">
                  <span className="lineup-comp">{match.competitionTitle}</span>
                  <span className={`lineup-diff is-${match.difficulty}`}>
                    {labels.difficulty[match.difficulty]}
                  </span>
                </span>

                <span className="lineup-card-meta">
                  <span className="lineup-year">{match.year}</span>
                  {match.label ? <span className="lineup-label">{match.label}</span> : null}
                </span>

                <span className="lineup-card-score">
                  <span className={`lineup-team ${match.winner === 'home' ? 'is-winner' : ''}`}>
                    {match.home}
                  </span>
                  <span className="lineup-result">{match.score}</span>
                  <span className={`lineup-team ${match.winner === 'away' ? 'is-winner' : ''}`}>
                    {match.away}
                  </span>
                </span>

                {note ? <span className="lineup-card-note">{note}</span> : null}

                <span className="lineup-card-foot">
                  <span>{labels.cardHint}</span>
                  <span className="lineup-card-players" aria-hidden="true">
                    👥 22
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      <Modal
        open={Boolean(selected)}
        title={labels.lineupsTitle}
        onClose={() => setSelectedId(null)}
        closeLabel={labels.close}
        className="lineup-modal"
      >
        {selected ? (
          <>
            <div className="lineup-match-head">
              <p className="lineup-modal-comp">
                {selected.competitionTitle} · {selected.year}
                {selected.label ? ` · ${selected.label}` : ''}
              </p>

              <div className="lineup-modal-score">
                <span className={`lineup-team ${selected.winner === 'home' ? 'is-winner' : ''}`}>
                  {selected.home}
                </span>
                <b className="lineup-modal-result">{selected.score}</b>
                <span className={`lineup-team ${selected.winner === 'away' ? 'is-winner' : ''}`}>
                  {selected.away}
                </span>
              </div>

              {decidedText(selected, labels) ? (
                <p className="lineup-modal-note">{decidedText(selected, labels)}</p>
              ) : null}
            </div>

            <div className="lineup-columns">
              <LineupSide
                team={selected.home}
                players={selected.homeLineup}
                labels={labels}
                side="home"
              />
              <LineupSide
                team={selected.away}
                players={selected.awayLineup}
                labels={labels}
                side="away"
              />
            </div>

            {selected ? (
              <div className="lineup-award">
                <div className="lineup-award-head">
                  <b className="lineup-award-title">{labels.awardTitle}</b>
                  <span className="lineup-award-hint">
                    {fill(labels.awardHint, {
                      points: pointsForMatch(selected),
                    })}
                  </span>
                </div>

                {award ? (
                  <div className="lineup-award-done">
                    <span>
                      {fill(labels.awarded, {
                        team: teamNames[award.team],
                        points: award.points,
                      })}
                    </span>
                    <button
                      type="button"
                      className="points-edit"
                      onClick={() => onUndoAward(selected.id)}
                    >
                      {labels.undo}
                    </button>
                  </div>
                ) : (
                  <div className="lineup-award-actions">
                    {[0, 1].map((index) => (
                      <button
                        key={index}
                        type="button"
                        className={`lineup-award-btn is-team-${index + 1}`}
                        onClick={() => onAward(selected, index)}
                      >
                        <span>{teamNames[index]}</span>
                        <b>+{pointsForMatch(selected)}</b>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            <div className="lineup-modal-foot">
              <span>{labels.startersNote}</span>
              {selected.source ? (
                <a
                  className="lineup-source"
                  href={selected.source}
                  target="_blank"
                  rel="noreferrer"
                >
                  ↗ {labels.source}
                </a>
              ) : null}
            </div>
          </>
        ) : null}
      </Modal>
    </section>
  );
}
