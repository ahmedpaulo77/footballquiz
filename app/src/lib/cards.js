/** منطق لعبة «Cards / الكروت» — التصدّي/الدفاع، الكومة المقلوبة، وسلامة الموازنة.
 * الحالة كائن غير قابل للتغيير — كل فعل بيرجع حالة جديدة. */

export const STATS = ['goals', 'trophies', 'caps', 'seasons', 'assists'];
/** كل مباراة بتظهر ٤ سمات بس — بنختارهم عشوائيًا من الـ٥. */
export const STATS_PER_MATCH = 4;
export const DECK_HAND = 7;
export const MAX_DRAWS = 3;
export const BALANCE_GAP = 2;

/** خلط عشوائي (مولّد قابل للتمرير للاختبارات). */
export function shuffle(items, random = Math.random) {
  const pool = [...items];

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const pick = Math.floor(random() * (index + 1));
    [pool[index], pool[pick]] = [pool[pick], pool[index]];
  }

  return pool;
}

/** بصمة مجموعة السمات (مستقلة عن الترتيب) — بنقارن بيها مجموعتين. */
export function statsSignature(stats) {
  return [...stats].sort().join(',');
}

/** قيمة السمة على الكارت (رقم آمن). */
export function statValue(card, stat) {
  const value = card && card[stat];
  return Number.isFinite(value) ? value : 0;
}

/** هل السمة متاحة بُلما هي استُخدمت أكتر من غيرها بفارق كبير؟
 * القاعدة: الفارق بين أكتر واستخدام وأقل استخدام ≤ BALANCE_GAP دايمًا. */
export function canCall(usage, stat, gap = BALANCE_GAP) {
  if (!usage || !(stat in usage)) return false;

  const next = { ...usage, [stat]: (usage[stat] ?? 0) + 1 };
  const values = Object.values(next);

  return Math.max(...values) - Math.min(...values) <= gap;
}

/** خلط + توزيع: كل لاعب بيسحب ٧، والباقي كومة مقلوبة.
 * avoidStats: سمات المباراة اللي فاتت — بنعيد السحب لحد ما المجموعة تختلف عنها. */
export function createMatch(pool, random = Math.random, avoidStats = null) {
  if (!Array.isArray(pool) || pool.length < DECK_HAND * 2) {
    throw new Error(`المخزون مش كفاية: محتاج على الأقل ${DECK_HAND * 2} كارت`);
  }

  const dealt = shuffle(pool, random);
  const hands = [dealt.slice(0, DECK_HAND), dealt.slice(DECK_HAND, DECK_HAND * 2)];
  const outside = dealt.slice(DECK_HAND * 2);
  const avoid = avoidStats ? statsSignature(avoidStats) : null;
  let stats = pickStats(random);

  for (let attempt = 0; avoid && statsSignature(stats) === avoid && attempt < 8; attempt += 1) {
    stats = pickStats(random);
  }

  return {
    poolSize: dealt.length,
    stats,
    turn: random() < 0.5 ? 0 : 1,
    hands,
    outside,
    drawsUsed: 0,
    usage: [createUsage(stats), createUsage(stats)],
    attack: null,
    discards: [],
    phase: 'attack',
    winner: null,
    lastResolution: null,
    turnCount: 0,
    emptied: [],
  };
}

function createUsage(stats) {
  return Object.fromEntries(stats.map((stat) => [stat, 0]));
}

function pickStats(random) {
  return shuffle(STATS, random).slice(0, STATS_PER_MATCH);
}

function cloneState(state) {
  return {
    ...state,
    hands: state.hands.map((hand) => [...hand]),
    outside: [...state.outside],
    usage: state.usage.map((entry) => ({ ...entry })),
    discards: [...state.discards],
    emptied: Array.isArray(state.emptied) ? [...state.emptied] : [],
  };
}

export const otherPlayer = (index) => (index === 0 ? 1 : 0);

/** يسجل لاعب خلص كروته (مرة واحدة بس) — من هنا بنحسب «اللي خلص الأول». */
function noteEmpty(next, player) {
  if (!next || next.hands[player].length > 0 || next.emptied.includes(player)) return;
  next.emptied = [...next.emptied, player];
}

/** المهاجم ينزل كارت + سمة (لو السمة لسه قايدة على التوازن). */
export function startAttack(state, { cardId, stat }) {
  if (!state || state.phase !== 'attack') {
    return { state, error: 'not-attack-turn' };
  }

  const player = state.turn;
  const card = state.hands[player].find((entry) => entry.id === cardId);
  if (!card) return { state, error: 'card-not-in-hand' };

  if (!canCall(state.usage[player], stat)) {
    return { state, error: 'stat-not-balanced' };
  }

  const next = cloneState(state);
  next.hands[player] = next.hands[player].filter((entry) => entry.id !== cardId);
  noteEmpty(next, player);
  next.attack = { player, card, stat };
  next.usage[player] = {
    ...next.usage[player],
    [stat]: (next.usage[player][stat] ?? 0) + 1,
  };
  next.drawsUsed = 0;
  next.turnCount += 1;

  // الكروت الخالية من الإيد ما تنهيش اللعبة — لازم الدفاع يتلعب الأول.
  next.phase = 'defense';

  return { state: next, error: null };
}

/** المدافع يحاول يغطي بكارت أعلى (أو يساوي) من إيده. */
export function defendFromHand(state, { cardId }) {
  if (!state || state.phase !== 'defense' || !state.attack) {
    return { state, error: 'not-defense-turn' };
  }

  const defender = otherPlayer(state.attack.player);
  const card = state.hands[defender].find((entry) => entry.id === cardId);
  if (!card) return { state, error: 'card-not-in-hand' };

  if (statValue(card, state.attack.stat) < statValue(state.attack.card, state.attack.stat)) {
    return { state, error: 'card-too-low' };
  }

  const next = cloneState(state);
  next.hands[defender] = next.hands[defender].filter((entry) => entry.id !== cardId);
  noteEmpty(next, defender);
  next.discards.push(next.attack.card, card);

  return { state: finishConfrontation(next, 'covered-hand', defender), error: null };
}

function finishConfrontation(state, resolution, defender) {
  const next = cloneState(state);
  next.attack = null;
  next.drawsUsed = 0;
  next.lastResolution = resolution;
  next.turn = defender;
  resolveEmptyHands(next);
  if (next.phase !== 'done') next.phase = 'attack';

  return next;
}

/** أول فريق يخلص كروته بيكسب — الاتنين خلصوا في نفس الجولة = تعادل. */
function resolveEmptyHands(state) {
  if (!state.emptied || state.emptied.length === 0) return;

  if (state.emptied.length === 1) {
    state.winner = state.emptied[0];
  } else {
    state.winner = 'draw';
  }

  state.phase = 'done';
}

/** المدافع يسحب كارت أعمى من الكومة (لحد ٣) — السحوبات الفاشلة تدخل إيده. */
export function drawBlind(state) {
  if (!state || state.phase !== 'defense' || !state.attack) {
    return { state, error: 'not-defense-turn' };
  }

  if (state.drawsUsed >= MAX_DRAWS) {
    return { state, error: 'draws-exhausted' };
  }

  const defender = otherPlayer(state.attack.player);
  const next = cloneState(state);

  if (next.outside.length === 0) {
    return { state: failConfrontation(next, defender), error: null };
  }

  const card = next.outside[next.outside.length - 1];
  next.outside = next.outside.slice(0, -1);
  next.drawsUsed += 1;

  const covers = statValue(card, state.attack.stat) >= statValue(state.attack.card, state.attack.stat);

  if (covers) {
    next.discards.push(state.attack.card, card);
    return { state: finishConfrontation(next, 'covered-draw', defender), error: null };
  }

  // الكارت اللي مسحوب لسه ما بيغطيهاش — بيروح لإيد المدافع على طول زي أي كارت.
  next.hands[defender] = [...next.hands[defender], card];

  if (next.drawsUsed >= MAX_DRAWS) {
    return { state: failConfrontation(next, defender), error: null };
  }

  return { state: next, error: null };
}

/** فشل التغطية: الكارت المهاجم يُكفّق، والسحوبات الفاشلة كلها تدخل إيد المدافع، والمهاجم يكمل هجمته. */
function failConfrontation(state, defender) {
  const next = cloneState(state);
  const attacker = state.attack.player;

  next.discards.push(state.attack.card);
  next.attack = null;
  next.drawsUsed = 0;
  next.lastResolution = 'failed';
  next.turn = attacker; // فشل الدفاع → المهاجم يكمل هجمته
  resolveEmptyHands(next);
  if (next.phase !== 'done') next.phase = 'attack';

  return next;
}
