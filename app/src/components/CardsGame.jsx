import { useEffect, useRef, useState } from 'react';
import TeamScoreboard from './TeamScoreboard.jsx';
import {
  MAX_DRAWS,
  canCall,
  createMatch,
  drawBlind,
  defendFromHand,
  startAttack,
  statValue,
} from '../lib/cards.js';

/** السمات كما تظهر في اللعبة (ترتيب العرض). */
const STAT_META = [
  { key: 'goals', icon: '⚽', labelKey: 'goals' },
  { key: 'trophies', icon: '🏆', labelKey: 'trophies' },
  { key: 'caps', icon: '🌍', labelKey: 'caps' },
  { key: 'seasons', icon: '⏳', labelKey: 'seasons' },
  { key: 'assists', icon: '🎯', labelKey: 'assists' },
];

const TURN_EMOJI = ['1️⃣', '2️⃣'];
const OTHER = (index) => (index === 0 ? 1 : 0);

function statMeta(stat) {
  return STAT_META.find((meta) => meta.key === stat) ?? STAT_META[0];
}

/** لعبة «الكروت / Cards» — الإيد على الأجهزة (hot-seat). */
export default function CardsGame({ quiz, ui, lang, teamNames, scores, onAddPoints, onEditTeams }) {
  const [match, setMatch] = useState(null);
  const [screen, setScreen] = useState('setup'); // setup | interstitial | turn | defense | reveal | done
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [selectedStat, setSelectedStat] = useState(null);
  const [reveal, setReveal] = useState(null);
  const [mustDraw, setMustDraw] = useState(false);
  const [awarded, setAwarded] = useState(false);
  const lastStatsRef = useRef(null);

  const t = ui.cards;
  const statsKey = (index) => (index === 0 ? 'teamOne' : 'teamTwo');
  const names = teamNames ?? [
    ui.teams[statsKey(0)],
    ui.teams[statsKey(1)],
  ];
  const usageFor = (index) => match?.usage[index] ?? {};
  const currentUsage = match ? usageFor(match.turn) : {};
  const deckEmpty = match ? match.outside.length === 0 : true;

  const startGame = () => {
    const next = createMatch(quiz.cards ?? [], Math.random, lastStatsRef.current);
    lastStatsRef.current = next.stats;
    setMatch(next);
    setScreen('interstitial');
    setSelectedCardId(null);
    setSelectedStat(null);
    setReveal(null);
    setMustDraw(false);
    setAwarded(false);
  };

  const teamOf = (index) => names[index];

  const activeTeamName = match ? teamOf(match.turn) : names[0];
  const defenderName = match?.attack ? teamOf(OTHER(match.attack.player)) : names[1];

  useEffect(() => {
    if (match?.phase === 'done' && !awarded) {
      if (typeof match.winner === 'number') {
        onAddPoints(match.winner, 1);
      }
      setAwarded(true);
    }
  }, [match?.phase, match?.winner, awarded, onAddPoints]);

  function leaveConfrontation(nextMatch, revealInfo) {
    setMatch(nextMatch);
    setSelectedCardId(null);
    setSelectedStat(null);
    setMustDraw(false);

    if (revealInfo) {
      setReveal(revealInfo);
      setScreen('reveal');
      return;
    }

    setReveal(null);
    setScreen(nextMatch.phase === 'done' ? 'done' : 'interstitial');
  }

  function tapStat(stat) {
    setSelectedStat(stat);
  }

  function advanceFromReveal() {
    setReveal(null);
    setScreen(match?.phase === 'done' ? 'done' : 'interstitial');
  }

  function playAttack() {
    if (!match || !selectedCardId || !selectedStat) return;

    const result = startAttack(match, { cardId: selectedCardId, stat: selectedStat });
    if (result.error) return;

    leaveConfrontation(result.state, null);
  }

  function playDefense(cardId) {
    if (!match || mustDraw) return;

    const attackCard = match.attack.card;
    const attackStat = match.attack.stat;
    const attackingPlayer = match.attack.player;
    const defender = OTHER(attackingPlayer);
    const attackValue = statValue(attackCard, attackStat);
    const coveringCard = match.hands[defender].find((entry) => entry.id === cardId) ?? null;

    // كارت أقل من اللي على الأرض: بيرجع إيده والمدافع مضطر يسحب.
    if (!coveringCard || statValue(coveringCard, attackStat) < attackValue) {
      setMustDraw(true);
      return;
    }

    const result = defendFromHand(match, { cardId });
    if (result.error) return;

    leaveConfrontation(result.state, {
      stat: attackStat,
      attackCard,
      attackTeam: attackingPlayer,
      attackValue,
      defender,
      coverCard: coveringCard,
      coverValue: coveringCard ? statValue(coveringCard, attackStat) : null,
      outcome: 'covered-hand',
    });
  }

  function drawFromDeck() {
    if (!match) return;

    const attackCard = match.attack.card;
    const attackStat = match.attack.stat;
    const attackingPlayer = match.attack.player;
    const defender = OTHER(attackingPlayer);
    const attacksValue = statValue(attackCard, attackStat);

    const result = drawBlind(match);
    if (result.error) return;

    const action = result.state.attack === null || result.state.phase === 'done';

    if (action) {
      const outcome = result.state.lastResolution === 'covered-draw' ? 'covered-draw' : 'failed';
      const cover = result.state.discards[result.state.discards.length - 1] ?? null;
      const covered = outcome === 'covered-draw';

      leaveConfrontation(result.state, {
        stat: attackStat,
        attackCard,
        attackTeam: attackingPlayer,
        attackValue: attacksValue,
        defender,
        coverCard: covered ? cover : null,
        coverValue: covered && cover ? statValue(cover, attackStat) : null,
        outcome,
      });
      return;
    }

    setMustDraw(false);
    setMatch(result.state);
  }

  const focusIndex = match
    ? match.phase === 'defense'
      ? OTHER(match.attack.player)
      : match.turn
    : 0;

  const statButtonStates = (match?.stats ?? []).map((key) => {
    const meta = statMeta(key);
    const used = currentUsage[key] ?? 0;
    const enabled = match?.phase === 'attack' && canCall(currentUsage, key);
    return { ...meta, used, enabled };
  });

  const scoreboard = (
    <TeamScoreboard
      names={names}
      scores={scores}
      roles={[ui.teams.teamOne, ui.teams.teamTwo]}
      pointsLabel={ui.teams.points}
      activeIndex={match && match.phase !== 'done' ? focusIndex : null}
      activeLabel={t.turnLabel}
      editLabel={ui.teams.edit}
      onEdit={onEditTeams}
    />
  );

  if (screen === 'setup') {
    return (
      <section className="cards-game" aria-label={t.boardAria}>
        {scoreboard}
        <div className="cards-setup">
          <p className="cards-setup-emoji" aria-hidden="true">
            <svg viewBox="0 0 120 168" className="cards-setup-card" role="presentation" aria-hidden="true">
              <defs>
                <linearGradient id="cardFront" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#2a1853" />
                  <stop offset="1" stopColor="#120a22" />
                </linearGradient>
                <linearGradient id="cardGlow" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#67e8f9" stopOpacity="0.9" />
                  <stop offset="0.5" stopColor="#22d3ee" stopOpacity="0.25" />
                  <stop offset="1" stopColor="#8b5cf6" stopOpacity="0.75" />
                </linearGradient>
              </defs>
              <rect x="4" y="4" width="112" height="160" rx="16" fill="url(#cardFront)" stroke="url(#cardGlow)" strokeWidth="4" />
              <text x="18" y="46" fontFamily="Cairo, sans-serif" fontSize="26" fontWeight="900" fill="#67e8f9">J</text>
              <text x="18" y="46" fontFamily="Cairo, sans-serif" fontSize="26" fontWeight="900" fill="#67e8f9" transform="rotate(180 60 84)">J</text>
              <circle cx="60" cy="88" r="30" fill="#0d0718" stroke="#67e8f9" strokeWidth="2.5" />
              <text x="60" y="99" fontFamily="Cairo, sans-serif" fontSize="30" fontWeight="900" fill="#ffffff" textAnchor="middle">⚽</text>
            </svg>
          </p>
          <h3>{t.setupTitle}</h3>
          <p>{t.setupGoal}</p>
          <p className="cards-setup-sub">{t.onceNote}</p>
          <button type="button" className="primary-btn full" onClick={startGame}>
            {t.start}
          </button>
        </div>
      </section>
    );
  }

  if (!match) return null;

  if (screen === 'interstitial') {
    const defending = match.phase === 'defense';
    const teamName = defending ? defenderName : activeTeamName;

    return (
      <section className="cards-game" aria-label={t.boardAria}>
        {scoreboard}
        <div className="cards-interstitial">
          <p className="cards-hand-count" aria-hidden="true">{TURN_EMOJI[focusIndex]}</p>
          <h3>{fill(t.readyTitle, { team: teamName })}</h3>
          {defending && match.attack ? (
            <p className="cards-attack-announce">
              {fill(t.attackAnnounce, {
                team: teamOf(match.attack.player),
                card: match.attack.card.name,
                stat: t[statMeta(match.attack.stat).labelKey],
              })}
            </p>
          ) : (
            <p>{t.readyBody}</p>
          )}
          <button
            type="button"
            className="primary-btn full"
            onClick={() => setScreen(defending ? 'defense' : 'turn')}
          >
            {t.ready}
          </button>
        </div>
      </section>
    );
  }

  if ((match.phase === 'done' || screen === 'done') && screen !== 'reveal') {
    const win = typeof match.winner === 'number' ? match.winner : null;
    const isDraw = match.winner === 'draw';

    return (
      <section className="cards-game" aria-label={t.boardAria}>
        {scoreboard}
        <div className="cards-done">
          <p className="cards-done-trophy" aria-hidden="true">{win === null ? '🤝' : '🏆'}</p>
          <h3>{win === null ? (isDraw ? t.drawTitle : t.playAgain) : fill(t.winner, { team: teamOf(win) })}</h3>
          {win !== null ? (
            <p>{fill(t.winnerNote, { team: teamOf(win), points: 1 })}</p>
          ) : null}
          <button type="button" className="primary-btn full" onClick={startGame}>
            {t.playAgain}
          </button>
        </div>
      </section>
    );
  }

  if (screen === 'reveal' && reveal) {
    const attackMeta = statMeta(reveal.stat);
    const winnerName =
      reveal.outcome === 'failed'
        ? reveal.attackCard.name
        : reveal.coverCard?.name ?? reveal.attackCard.name;

    return (
      <section className="cards-game" aria-label={t.boardAria}>
        {scoreboard}
        <div className="reveal-screen">
          <p className="reveal-title">{t.attackResult}</p>

          <div className="reveal-duel">
            <div className="reveal-side">
              <p className="reveal-side-team">{teamOf(reveal.attackTeam)}</p>
              <span className="reveal-side-name">{reveal.attackCard.name}</span>
              <span className="reveal-side-row">
                <span aria-hidden="true">{attackMeta.icon}</span>
              </span>
            </div>

            <div className="reveal-vs" aria-hidden="true">VS</div>

            <div className="reveal-side is-defense">
              <p className="reveal-side-team">{teamOf(reveal.defender)}</p>
              <span className="reveal-side-name">
                {reveal.coverCard ? reveal.coverCard.name : t.noCoverShort}
              </span>
              <span className="reveal-side-row">
                {reveal.coverCard ? (
                  <span aria-hidden="true">{attackMeta.icon}</span>
                ) : (
                  <span className="reveal-no-cover">—</span>
                )}
              </span>
            </div>
          </div>

          <p className="reveal-outcome">{fill(t.roundWinner, { name: winnerName })}</p>

          <button type="button" className="primary-btn full" onClick={advanceFromReveal}>
            {t.pointsValue}
          </button>
        </div>
      </section>
    );
  }

  const myHand = match.hands[match.turn];

  if (screen === 'turn' || match.phase === 'attack') {
    const myCount = myHand.length;
    const opponentCount = match.hands[OTHER(match.turn)].length;

    return (
      <section className="cards-game" aria-label={t.boardAria}>
        {scoreboard}

        <div className="cards-counts">
          <span>{fill(t.yourCards, { count: myCount })}</span>
          <span>{fill(t.opponentCards, { count: opponentCount })}</span>
          <span>{fill(t.discards, { count: match.discards.length })}</span>
        </div>

        <h3 className="cards-hand-title">{fill(t.activeTeam, { team: teamOf(match.turn) })}</h3>

        <div className="cards-grid" role="group" aria-label={t.tapCard}>
          {myHand.map((card, index) => (
            <button
              key={card.id}
              type="button"
              className={`player-card ${selectedCardId === card.id ? 'is-selected' : ''}`}
              style={{ '--i': index }}
              aria-pressed={selectedCardId === card.id}
              onClick={() => setSelectedCardId(card.id)}
            >
              <span className="player-card-strip" aria-hidden="true" />
              <span className="player-card-name">{card.name}</span>
            </button>
          ))}
        </div>

        <div className="stat-picks" role="group" aria-label={t.chooseStat}>
          {statButtonStates.map((meta) => (
            <button
              key={meta.key}
              type="button"
              className={`stat-pick ${selectedStat === meta.key ? 'is-selected' : ''}`}
              disabled={!meta.enabled}
              aria-pressed={selectedStat === meta.key}
              title={fill(t.usedCount, { count: meta.used })}
              onClick={() => tapStat(meta.key)}
            >
              <span className="stat-pick-icon" aria-hidden="true">{meta.icon}</span>
              <span className="stat-pick-label">{t[meta.labelKey]}</span>
              <span className="stat-pick-used" aria-hidden="true">×{meta.used}</span>
            </button>
          ))}
        </div>

        <p className="cards-stat-hint">{t.statHint}</p>
        <p className="controls-hint">{t.playHint}</p>

        <button
          type="button"
          className="primary-btn full"
          disabled={!selectedCardId || !selectedStat}
          onClick={playAttack}
        >
          {t.playCard}
        </button>
      </section>
    );
  }

  // شاشة الدفاع
  const attackingPlayer = match.attack.player;
  const defender = OTHER(attackingPlayer);
  const attackedCard = match.attack.card;
  const attackMeta = statMeta(match.attack.stat);
  const myDefenseHand = match.hands[defender];

  return (
    <section className="cards-game" aria-label={t.boardAria}>
      {scoreboard}

      <div className="attack-spotlight">
        <span className="attack-spotlight-emoji" aria-hidden="true">{attackMeta.icon}</span>
        <div className="attack-spotlight-body">
          <p className="attack-spotlight-label">{t[attackMeta.labelKey]}</p>
          <span className="attack-spotlight-name">{attackedCard.name}</span>
        </div>
      </div>

      <p className={mustDraw ? 'controls-hint is-warning' : 'controls-hint'}>
        {mustDraw ? t.cardTooLow : t.defenseHint}
      </p>

      <div className="cards-grid is-defense">
        {myDefenseHand.map((card, index) => (
          <button
            key={card.id}
            type="button"
            className={`player-card ${mustDraw ? 'is-frozen' : ''}`}
            style={{ '--i': index }}
            disabled={mustDraw}
            onClick={() => playDefense(card.id)}
            aria-label={card.name}
          >
            <span className="player-card-strip" aria-hidden="true" />
            <span className="player-card-name">{card.name}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        className={`primary-btn full ${mustDraw ? 'is-forced' : ''}`}
        disabled={!deckEmpty && match.drawsUsed >= MAX_DRAWS}
        onClick={drawFromDeck}
      >
        {deckEmpty ? t.noCover : fill(t.draw, { count: match.outside.length })}
      </button>
    </section>
  );
}

function fill(template, values) {
  return String(template ?? '').replace(/\{(\w+)\}/g, (match, key) =>
    values[key] == null ? match : String(values[key]),
  );
}
