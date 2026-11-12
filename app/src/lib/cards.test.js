import { describe, expect, it } from 'vitest';
import {
  BALANCE_GAP,
  DECK_HAND,
  MAX_DRAWS,
  STATS,
  STATS_PER_MATCH,
  canCall,
  createMatch,
  drawBlind,
  defendFromHand,
  shuffle,
  startAttack,
  statValue,
  statsSignature,
} from './cards.js';

const card = (id, stats) => ({ id, ...stats });

const low = (id) => card(id, { goals: 1, trophies: 1, caps: 1, seasons: 1 });
const mid = (id) => card(id, { goals: 5, trophies: 2, caps: 20, seasons: 6 });
const high = (id) => card(id, { goals: 9, trophies: 4, caps: 40, seasons: 9 });
const boss = (id) => card(id, { goals: 20, trophies: 8, caps: 90, seasons: 12 });

/** مباراة بسمات ثابتة عشان الاختبارات تشتغل على أرقام معروفة. */
function withStats(match, stats = ['goals', 'trophies', 'caps', 'seasons']) {
  const usage = () => Object.fromEntries(stats.map((stat) => [stat, 0]));
  return { ...match, stats, usage: [usage(), usage()] };
}

function seededRandom(seed) {
  let state = seed >>> 0 || 1;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function pool(size) {
  return Array.from({ length: size }, (_, index) =>
    index % 4 === 3
      ? boss('p' + index)
      : card('p' + index, {
          goals: (index * 7 + 13) % 60,
          trophies: (index * 3 + 5) % 12,
          caps: (index * 11 + 7) % 120,
          seasons: (index * 5 + 3) % 15 + 3,
        }),
  );
}

describe('«Cards / الكروت» — المخ', () => {
  it('بينظم بكارتين في الإيدي وتوزيع متبقي للكومة', () => {
    const cards = pool(DECK_HAND * 2 + 9);
    const match = createMatch(cards, seededRandom(7));

    expect(match.hands[0]).toHaveLength(DECK_HAND);
    expect(match.hands[1]).toHaveLength(DECK_HAND);
    expect(match.outside).toHaveLength(9);
    expect(match.phase).toBe('attack');
    expect(match.turn === 0 || match.turn === 1).toBe(true);
    expect([...match.hands[0], ...match.hands[1], ...match.outside].map((c) => c.id).sort()).toEqual(
      [...cards].map((c) => c.id).sort(),
    );
  });

  it('الـ shuffle بحجم المخزون ولا يفقد عناصر', () => {
    const cards = pool(30);
    const shuffled = shuffle(cards, seededRandom(99));

    expect(shuffled).toHaveLength(cards.length);
    expect([...shuffled].map((c) => c.id).sort()).toEqual([...cards].map((c) => c.id).sort());
  });

  it('كل مباراة بتختار ٤ سمات مختلفة من الـ٥', () => {
    const match = createMatch(pool(DECK_HAND * 2 + 4), seededRandom(3));

    expect(match.stats).toHaveLength(STATS_PER_MATCH);
    expect(new Set(match.stats).size).toBe(STATS_PER_MATCH);
    for (const stat of match.stats) expect(STATS).toContain(stat);
    expect(Object.keys(match.usage[0])).toEqual(match.stats);
    expect(Object.keys(match.usage[1])).toEqual(match.stats);
    for (const stat of match.stats) expect(match.usage[0][stat]).toBe(0);
  });

  it('اختيار السمات بيتغير من مباراة لمباراة', () => {
    const seen = new Set();
    for (let seed = 1; seed <= 20; seed += 1) {
      seen.add(createMatch(pool(DECK_HAND * 2 + 4), seededRandom(seed)).stats.join(','));
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it('المباراة الجديدة ما بتكررش نفس مجموعة سمات اللي قبلها', () => {
    for (let seed = 1; seed <= 20; seed += 1) {
      const previous = createMatch(pool(DECK_HAND * 2 + 4), seededRandom(seed));
      const next = createMatch(pool(DECK_HAND * 2 + 4), seededRandom(seed), previous.stats);

      expect(next.stats).toHaveLength(STATS_PER_MATCH);
      expect(statsSignature(next.stats)).not.toBe(statsSignature(previous.stats));
    }
  });

  it('canCall بيرفض السمة اللي مش من سمات المباراة', () => {
    const usage = { goals: 0, trophies: 0, caps: 0, seasons: 0 };
    expect(canCall(usage, 'assists')).toBe(false);
    expect(canCall(usage, 'goals')).toBe(true);
  });

  it('statValue مآمن مع بيانات ناقصة/كسرية', () => {
    expect(statValue(card('a', { goals: 7 }), 'goals')).toBe(7);
    expect(statValue(card('a', {}), 'goals')).toBe(0);
    expect(statValue(card('a', { caps: Number.NaN }), 'caps')).toBe(0);
  });

  describe('موازنة السمات (الفارق ≤ ٢)', () => {
    const selected = ['goals', 'trophies', 'caps', 'seasons'];
    const fresh = () => Object.fromEntries(selected.map((stat) => [stat, 0]));

    it('كل سمة من سمات المباراة متاحة في البداية', () => {
      for (const stat of selected) expect(canCall(fresh(), stat)).toBe(true);
    });

    it('حد أقصى مرتين لكل سمة لو الباقي متساوي', () => {
      const usage = { goals: 0, trophies: 0, caps: 0, seasons: 0 };

      expect(canCall(usage, 'goals')).toBe(true);
      expect(canCall({ ...usage, goals: 1 }, 'goals')).toBe(true); // تاني استخدام، لسه فوق الصفر
      expect(canCall({ ...usage, goals: 2 }, 'goals')).toBe(false); // تالت استخدام
      expect(canCall({ ...usage, goals: 2, trophies: 1, caps: 1, seasons: 1 }, 'goals')).toBe(true); // الكل بيلحقوا الفارق
    });

    it('يتوازن بعد ما تلعب باقي السمات', () => {
      const usage = { goals: 2, trophies: 0, caps: 0, seasons: 0 };

      expect(canCall(usage, 'goals')).toBe(false);
      expect(canCall(usage, 'trophies')).toBe(true);
    });

    it('الفارق لا يتعدى الـ BALANCE_GAP في أي ترتيب', () => {
      let usage = fresh();

      for (let step = 0; step < 40; step += 1) {
        const legal = selected.filter((stat) => canCall(usage, stat));
        expect(legal.length).toBeGreaterThan(0);
        const stat = legal[seededRandom(step + 1)() % legal.length] ?? legal[0];
        usage = { ...usage, [stat]: usage[stat] + 1 };

        const values = selected.map((key) => usage[key]);
        expect(Math.max(...values) - Math.min(...values)).toBeLessThanOrEqual(BALANCE_GAP);
      }
    });
  });

  describe('الهجوم', () => {
    it('ينقل الكارت من الإيد لكارت الهجوم ويقلع الاستخدام', () => {
      const match = withStats(createMatch(pool(26), seededRandom(11)));
      const attacker = match.turn;
      const target = match.hands[attacker][0];

      const { state, error } = startAttack(match, { cardId: target.id, stat: 'goals' });

      expect(error).toBeNull();
      expect(state.hands[attacker]).toHaveLength(DECK_HAND - 1);
      expect(state.attack?.card.id).toBe(target.id);
      expect(state.usage[attacker].goals).toBe(1);
      expect(state.phase).toBe('defense');
    });

    it('يرفض كارت مش في الإيد', () => {
      const match = withStats(createMatch(pool(26), seededRandom(12)));
      const { error } = startAttack(match, { cardId: 'nope', stat: 'goals' });

      expect(error).toBe('card-not-in-hand');
    });

    it('يرفض سمة غير متوازنة', () => {
      const match = withStats(createMatch(pool(26), seededRandom(13)));
      const attacker = match.turn;
      const rigged = { ...match, usage: [{ goals: 2, trophies: 0, caps: 0, seasons: 0 }, { goals: 0, trophies: 0, caps: 0, seasons: 0 }] };
      if (attacker === 1) rigged.usage = [rigged.usage[1], { goals: 2, trophies: 0, caps: 0, seasons: 0 }];

      const { error } = startAttack(rigged, { cardId: rigged.hands[attacker][0].id, stat: 'goals' });

      expect(error).toBe('stat-not-balanced');
    });
  });

  describe('الدفاع من الإيد', () => {
    it('يكبس بكارت مدعوم أعلى أو يساوي', () => {
      const match = withStats(createMatch(pool(26), seededRandom(21)));
      const attacker = match.turn;
      const defender = attacker === 0 ? 1 : 0;
      match.hands[defender] = match.hands[defender].map((entry, index) =>
        index === 0 ? { ...entry, goals: 999 } : entry,
      );

      const attackCard = match.hands[attacker][0];
      const { state: afterAttack } = startAttack(match, { cardId: attackCard.id, stat: 'goals' });
      const covering = afterAttack.hands[defender].find((entry) => entry.goals === 999);
      const { state, error } = defendFromHand(afterAttack, { cardId: covering.id });

      expect(error).toBeNull();
      expect(state.discards.map((entry) => entry.id)).toEqual([attackCard.id, covering.id]);
      expect(state.turn).toBe(defender);

      expect(state.phase === 'attack' || state.phase === 'done').toBe(true);
    });

    it('يرفض كارت أدنى من البطاقة المهاجمة', () => {
      const match = withStats(createMatch(pool(26), seededRandom(22)));
      const attacker = match.turn;
      const defender = attacker === 0 ? 1 : 0;
      match.hands[attacker] = match.hands[attacker].map((entry, index) =>
        index === 0 ? { ...entry, goals: 50 } : entry,
      );
      match.hands[defender] = match.hands[defender].map((entry, index) =>
        index === 0 ? { ...entry, goals: 1 } : entry,
      );

      const attackCard = match.hands[attacker][0];
      const { state: afterAttack } = startAttack(match, { cardId: attackCard.id, stat: 'goals' });
      const lowCard = afterAttack.hands[defender].find((entry) => entry.goals === 1);
      const { error } = defendFromHand(afterAttack, { cardId: lowCard.id });

      expect(error).toBe('card-too-low');
    });
  });

  describe('السحب من الكومة المقلوبة', () => {
    function rigMatchForDraw() {
      const match = withStats(createMatch(pool(26), seededRandom(31)));
      const attacker = match.turn;
      const defender = attacker === 0 ? 1 : 0;

      // المهاجم فيه كارت goals عالٍ؛ المدافع كله كروت goals صغيرة.
      match.hands[attacker] = [{ ...match.hands[attacker][0], goals: 1000 }, ...match.hands[attacker].slice(1)];
      match.hands[defender] = match.hands[defender].map((entry) => ({ ...entry, goals: 0 }));

      return { match, attacker, defender };
    }

    it('سحب ٣ مرات فاشلة يدخلها إيدي والمهاجم يكمل هجمته', () => {
      const { match, attacker, defender } = rigMatchForDraw();
      const attackCard = match.hands[attacker][0];
      const { state: afterAttack } = startAttack(match, { cardId: attackCard.id, stat: 'goals' });

      // الكومة بترتيب السحب: آخر عنصر هو أول مسحوب.
      const rigged = {
        ...afterAttack,
        outside: [low('c'), low('b'), low('a')],
      };
      const after1 = drawBlind(rigged);

      expect(after1.error).toBeNull();
      expect(after1.state.drawsUsed).toBe(1);
      expect(after1.state.hands[defender].map((entry) => entry.id)).toContain('a');
      expect(after1.state.hands[defender]).toHaveLength(8);
      expect(after1.state.lastResolution).toBeNull();

      const after2 = drawBlind(after1.state);

      expect(after2.state.drawsUsed).toBe(2);
      expect(after2.state.hands[defender].map((entry) => entry.id)).toEqual(
        expect.arrayContaining(['a', 'b']),
      );

      const after3 = drawBlind(after2.state);

      expect(after3.error).toBeNull();
      expect(after3.state.lastResolution).toBe('failed');
      expect(after3.state.hands[defender].map((entry) => entry.id)).toEqual(
        expect.arrayContaining(['a', 'b', 'c']),
      );
      expect(after3.state.turn).toBe(attacker);
    });

    it('كارت غيد بيوقفه السحب ويرمي الفاشلين لإيدي', () => {
      const { match, attacker, defender } = rigMatchForDraw();
      const attackCard = match.hands[attacker][0];
      const { state: afterAttack } = startAttack(match, { cardId: attackCard.id, stat: 'goals' });

      // السحب الأول (آخر عنصر) يفشل؛ السحب التاني (boss) يُغطي.
      const rigged = {
        ...afterAttack,
        outside: [card('winner', { goals: 1500, trophies: 0, caps: 0, seasons: 0 }), low('x')],
      };
      const { state } = drawBlind(rigged);

      expect(state.drawsUsed).toBe(1);
      expect(state.hands[defender].map((entry) => entry.id)).toContain('x');
      expect(state.lastResolution).toBeNull();

      const afterCover = drawBlind(state);

      expect(afterCover.error).toBeNull();
      expect(afterCover.state.lastResolution).toBe('covered-draw');
      expect(afterCover.state.discards.map((entry) => entry.id)).toEqual([attackCard.id, 'winner']);
      expect(afterCover.state.hands[defender].map((entry) => entry.id)).toContain('x');
      expect(afterCover.state.turn).toBe(defender);
    });

    it('توقف السحب لو الكومة فضيت وبرضه بيفشّل', () => {
      const { match, attacker, defender } = rigMatchForDraw();
      const attackCard = match.hands[attacker][0];
      const { state: afterAttack } = startAttack(match, { cardId: attackCard.id, stat: 'goals' });

      const rigged = { ...afterAttack, outside: [low('only')] };
      const after1 = drawBlind(rigged);
      const after2 = drawBlind(after1.state);

      expect(after2.error).toBeNull();
      expect(after2.state.lastResolution).toBe('failed');
      expect(after2.state.hands[defender].map((entry) => entry.id)).toContain('only');
    });

    it('MAX_DRAWS هو ٣', () => {
      expect(MAX_DRAWS).toBe(3);
    });
  });

  describe('حسم اللعبة', () => {
    it('المهاجم يكسب لما يتخلص من كروته الأخيرة في هجوم فاشل', () => {
      const match = withStats(createMatch(pool(20), seededRandom(41)));
      const attacker = match.turn;
      const defender = 1 - attacker;

      match.hands[attacker] = [match.hands[attacker][0]];
      match.hands[defender] = [low('x'), low('y'), low('z'), low('w'), low('v')];
      match.outside = [];

      const attackCard = match.hands[attacker][0];
      const { state: afterAttack } = startAttack(match, { cardId: attackCard.id, stat: 'goals' });

      // اللعبة ما خلصتش هنا — لازم اللاعب المدافع ياخد فرصته بالدفاع
      expect(afterAttack.phase).toBe('defense');
      expect(afterAttack.winner).toBeNull();

      const defense = drawBlind(afterAttack);

      expect(defense.error).toBeNull();
      expect(defense.state.lastResolution).toBe('failed');
      expect(defense.state.winner).toBe(attacker);
      expect(defense.state.phase).toBe('done');
    });

    it('لو اتنين خلصوا إيدهم في نفس الجولة، بيبقى تعادل', () => {
      const match = withStats(createMatch(pool(20), seededRandom(43)));
      const attacker = match.turn;
      const defender = 1 - attacker;

      match.hands[attacker] = [high('atk')];
      match.hands[defender] = [boss('def-last')];
      match.outside = [];

      const { state: afterAttack } = startAttack(match, { cardId: 'atk', stat: 'goals' });

      expect(afterAttack.phase).toBe('defense');
      expect(afterAttack.winner).toBeNull();

      const { state, error } = defendFromHand(afterAttack, { cardId: 'def-last' });

      expect(error).toBeNull();
      expect(state.phase).toBe('done');
      expect(state.winner).toBe('draw');
    });

    it('المدافع يكسب لو خلص كروته الأول وهو بيدافع، والمهاجم لسه عنده كروت', () => {
      const match = withStats(createMatch(pool(20), seededRandom(53)));
      const attacker = match.turn;
      const defender = 1 - attacker;

      match.hands[attacker] = [high('atk'), mid('spare1'), mid('spare2')];
      match.hands[defender] = [boss('def-last')];
      match.outside = [];

      const { state: afterAttack } = startAttack(match, { cardId: 'atk', stat: 'goals' });
      const { state, error } = defendFromHand(afterAttack, { cardId: 'def-last' });

      expect(error).toBeNull();
      expect(state.winner).toBe(defender);
      expect(state.phase).toBe('done');
    });
  });

  it('اللعبة تتقصر عشوائيًا من غير تراكمات ولا انفجارات', () => {
    for (const seed of [5, 6, 42, 97, 314]) {
      const match = createMatch(pool(28), seededRandom(seed));
      let state = match;
      let guard = 0;
      const totalCards = [...state.hands[0], ...state.hands[1], ...state.outside].length;

      while (state.phase !== 'done' && guard < 400) {
        guard += 1;

        if (state.phase === 'attack') {
          const player = state.turn;
          const cardEntry = state.hands[player][guard % state.hands[player].length];
          const stat = state.stats[guard % state.stats.length];
          const result = startAttack(state, { cardId: cardEntry.id, stat });

          if (result.error === null) {
            state = result.state;
            continue;
          }

          const fallbackStat = state.stats.find((key) => canCall(state.usage[player], key));
          const fallback = startAttack(state, {
            cardId: state.hands[player][0].id,
            stat: fallbackStat,
          });
          state = fallback.state;
          continue;
        }

        if (state.phase === 'defense') {
          const defender = state.attack.player === 0 ? 1 : 0;
          const attackValue = statValue(state.attack.card, state.attack.stat);
          const covering = state.hands[defender].find((entry) => statValue(entry, state.attack.stat) >= attackValue);

          if (covering) {
            state = defendFromHand(state, { cardId: covering.id }).state;
          } else if (state.drawsUsed < MAX_DRAWS && state.outside.length > 0) {
            state = drawBlind(state).state;
          } else {
            state = drawBlind(state).state; // فشل/ميثاق يفضّل الإنسبال بدل حلقة انتظار
          }
        }
      }

      expect(state.phase).toBe('done');
      expect([0, 1, 'draw'].includes(state.winner)).toBe(true);

      const inPlay =
        state.hands[0].length + state.hands[1].length + state.outside.length + state.discards.length;
      expect(inPlay).toBe(totalCards);

      const spread0 = Math.max(...Object.values(state.usage[0])) - Math.min(...Object.values(state.usage[0]));
      const spread1 = Math.max(...Object.values(state.usage[1])) - Math.min(...Object.values(state.usage[1]));
      expect(spread0).toBeLessThanOrEqual(BALANCE_GAP);
      expect(spread1).toBeLessThanOrEqual(BALANCE_GAP);
    }
  });
});
