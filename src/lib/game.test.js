import { describe, expect, it } from 'vitest';
import { PLAYABLE_PLAYERS, PLAYERS } from '../data/players.js';
import { PROFILES } from '../data/profiles.js';
import { MAX_CLUES, buildClues, normalize, pickPlayer } from './game.js';

const byId = (id) => PLAYERS.find((player) => player.id === id);

describe('normalize', () => {
  it('يوحّد الهمزات والتاء المربوطة والياء', () => {
    expect(normalize('أحمد')).toBe(normalize('احمد'));
    expect(normalize('محمّد')).toBe('محمد');
    expect(normalize('فتحى')).toBe(normalize('فتحي'));
    expect(normalize('حمادة')).toBe(normalize('حماده'));
  });

  it('بيشيل التشكيل والمسافات الزيادة', () => {
    expect(normalize('  محمد   صلاح  ')).toBe('محمد صلاح');
    expect(normalize('مُحَمَّد')).toBe('محمد');
  });
});

describe('تلميحات «من أنا؟»', () => {
  it('بيرجع ٣ تلميحات مرتبة من الغامض للواضح', () => {
    const clues = buildClues(byId('salah'));
    expect(clues).toHaveLength(MAX_CLUES);
    expect(clues.map((clue) => clue.id)).toEqual(['start', 'journey', 'identity']);
  });

  it('التلميح الأول بيحكي عن البداية', () => {
    const [first] = buildClues(byId('salah'));
    expect(first.text).toContain('2010');
    expect(first.text).toContain('المقاولون العرب');
  });

  it('التلميح التاني بيجمع الأندية والزملاء', () => {
    const [, second] = buildClues(byId('salah'));
    expect(second.text).toContain('ليفربول');
    expect(second.text).toContain('ساديو ماني');
  });

  it('التلميح التالت بيوري الهوية والإنجازات', () => {
    const [, , third] = buildClues(byId('salah'));
    expect(third.text).toContain('مهاجم');
    expect(third.text).toContain('مصر');
    expect(third.text).toContain('«م»');
  });

  it('اللاعبين اللي مالهمش بروفايل ليهم تلميحات بديلة', () => {
    const fallbackPlayer = PLAYERS.find((player) => !player.profile);
    expect(fallbackPlayer).toBeTruthy();

    const clues = buildClues(fallbackPlayer);
    expect(clues).toHaveLength(MAX_CLUES);
    expect(clues[0].text).toContain(fallbackPlayer.continent);
    expect(clues[1].text).toContain(fallbackPlayer.club);
    expect(clues[2].text).toContain(fallbackPlayer.nationality);
    expect(clues.map((clue) => clue.text).join(' ')).not.toContain(fallbackPlayer.name);
  });

  it('مفيش تلميح بيحرق اسم اللاعب', () => {
    for (const player of PLAYABLE_PLAYERS) {
      const text = buildClues(player)
        .map((clue) => clue.text)
        .join(' ');
      expect(text, player.name).not.toContain(player.name);
    }
  });

  it('اللقب اللي جزء من الاسم مش بيتكرر كتلميح', () => {
    const text = buildClues(byId('muller'))
      .map((clue) => clue.text)
      .join(' ');
    expect(text).not.toContain('مولر');
  });

  it('كل التلميحات نص مفيد ومش فاضية', () => {
    for (const player of PLAYABLE_PLAYERS) {
      for (const clue of buildClues(player)) {
        expect(clue.text.length, player.name).toBeGreaterThan(20);
        expect(clue.label.length, player.name).toBeGreaterThan(0);
      }
    }
  });
});

describe('اختيار اللاعب', () => {
  it('بيختار دايمًا لاعب عنده بروفايل كامل', () => {
    for (let i = 0; i < 20; i += 1) {
      const player = pickPlayer();
      expect(player.profile, player.name).toBeTruthy();
      expect(buildClues(player)).toHaveLength(MAX_CLUES);
    }
  });

  it('بيستبعد اللاعبين المطلوب استبعادهم', () => {
    const excluded = PLAYABLE_PLAYERS.slice(0, 20).map((player) => player.id);

    for (let i = 0; i < 30; i += 1) {
      const player = pickPlayer({ excludeIds: excluded });
      expect(excluded).not.toContain(player.id);
    }
  });

  it('لو كل اللاعبين مستبعدين بيرجع لاعب برضه', () => {
    const excluded = PLAYABLE_PLAYERS.map((player) => player.id);
    const player = pickPlayer({ excludeIds: excluded });

    expect(player).toBeTruthy();
    expect(player.id).toBeTruthy();
  });
});

describe('سلامة بنك اللاعبين والبروفايلات', () => {
  it('كل اللاعبين عندهم بيانات كاملة', () => {
    for (const player of PLAYERS) {
      expect(player.id, player.name).toBeTruthy();
      expect(player.name, player.id).toBeTruthy();
      expect(player.nationality, player.name).toBeTruthy();
      expect(player.continent, player.name).toBeTruthy();
      expect(player.club, player.name).toBeTruthy();
      expect(player.league, player.name).toBeTruthy();
      expect(['حارس', 'مدافع', 'وسط', 'مهاجم'], player.name).toContain(player.position);
      expect(player.age, player.name).toBeGreaterThan(15);
      expect(player.age, player.name).toBeLessThan(70);
    }
  });

  it('مفيش IDs أو أسماء مكررة', () => {
    const ids = PLAYERS.map((player) => player.id);
    const names = PLAYERS.map((player) => player.name);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(names).size).toBe(names.length);
  });

  it('كل بروفايل مربوط بلاعب موجود', () => {
    for (const id of Object.keys(PROFILES)) {
      expect(byId(id), id).toBeTruthy();
    }
  });

  it('كل بروفايل فيه بيانات كافية للتلميحات', () => {
    for (const [id, profile] of Object.entries(PROFILES)) {
      expect(profile.clubs.length, id).toBeGreaterThan(0);
      expect(profile.debut, id).toBeGreaterThan(1980);
      expect(profile.debut, id).toBeLessThan(2026);
      expect(profile.teammates.length, id).toBeGreaterThan(0);
      expect(profile.trophies.length, id).toBeGreaterThan(0);
    }
  });

  it('عدد اللاعبين الجاهزين للعب مناسب', () => {
    expect(PLAYABLE_PLAYERS.length).toBeGreaterThanOrEqual(80);
  });
});
