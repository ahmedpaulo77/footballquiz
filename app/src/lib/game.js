import { PLAYABLE_PLAYERS, PLAYERS, POSITIONS } from '../data/players.js';

/** عدد التلميحات في كل بطاقة لاعب. */
export const MAX_CLUES = 3;

const ARABIC_DIACRITICS = /[\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed\u0640]/g;

/**
 * توحيد النص — مستخدم عشان نمنع تكرار اللقب لو هو جزء من اسم اللاعب.
 */
export function normalize(text = '') {
  return String(text)
    .toLowerCase()
    .replace(ARABIC_DIACRITICS, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^\p{L}\p{N} ]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatList(items = []) {
  return items.filter(Boolean).join(' · ');
}

/**
 * تلميحات اللاعب — 3 بطاقات بتظهر كلها مع بعض للمقدّم.
 * اللاعبين اللي مالهمش بروفايل، بنولّد لهم تلميحات من بياناتهم الأساسية.
 */
export function buildClues(player) {
  if (!player) return [];

  const initial = player.name.trim().charAt(0);
  const profile = player.profile;

  if (!profile) {
    return [
      {
        id: 'origin',
        label: 'من وين؟',
        text: `أنا من ${player.continent}، وبلعب في مركز ${player.position}.`,
      },
      {
        id: 'club',
        label: 'النادي',
        text: `النادي الأشهر في مسيرتي هو ${player.club}، وبلعب في ${player.league}.`,
      },
      {
        id: 'identity',
        label: 'الهوية',
        text: `بلدي ${player.nationality}، وعمري ${player.age} سنة، واسمي بيبدأ بحرف «${initial}».`,
      },
    ];
  }

  const clubs = profile.clubs || [];
  const firstClub = clubs[0] || player.club;
  const otherClubs = clubs.slice(1);
  const teammates = (profile.teammates || []).slice(0, 3);
  const trophies = (profile.trophies || []).slice(0, 3);

  const journey =
    otherClubs.length > 0
      ? `بعدها لعبت في: ${formatList(otherClubs)}.`
      : `وما لعبتش لأي نادي تاني غير ${firstClub}.`;

  const mates = teammates.length ? ` وكان أبرز زمايلي: ${formatList(teammates)}.` : '';

  // اللقب لو داخل في اسم اللاعب أو الاسم داخل فيه، مش بيضيف حاجة — بنشيله.
  const nameKey = normalize(player.name);
  const nicknameKey = profile.nickname ? normalize(profile.nickname) : '';
  const nickname =
    nicknameKey && !nameKey.includes(nicknameKey) && !nicknameKey.includes(nameKey)
      ? profile.nickname
      : '';

  const identity =
    `أنا ${player.position} من ${player.nationality}، وعندي ${player.age} سنة.` +
    (trophies.length ? ` من أبرز إنجازاتي: ${formatList(trophies)}.` : '') +
    (nickname ? ` الناس بتلقبني بـ«${nickname}».` : '') +
    (profile.shirt ? ` وأشهر رقم قميص لبسته هو ${profile.shirt}.` : '') +
    ` واسمي بيبدأ بحرف «${initial}».`;

  return [
    {
      id: 'start',
      label: 'المحطة الأولى',
      text: `بدأت مسيرتي الاحترافية سنة ${profile.debut} مع ${firstClub}.`,
    },
    {
      id: 'journey',
      label: 'الزملاء والمسيرة',
      text: `${journey}${mates}`,
    },
    {
      id: 'identity',
      label: 'الهوية والإنجازات',
      text: identity,
    },
  ];
}

/**
 * اختيار لاعب عشوائي من اللي عندهم بروفايل كامل.
 * بنستبعد آخر اللاعبين اللي ظهروا عشان ميتكررش نفس اللاعب ورا بعضه.
 */
export function pickPlayer({ excludeIds = [] } = {}) {
  const base = PLAYABLE_PLAYERS.length ? PLAYABLE_PLAYERS : PLAYERS;
  const excluded = new Set(excludeIds);
  const available = base.filter((player) => !excluded.has(player.id));
  const pool = available.length ? available : base;

  return pool[Math.floor(Math.random() * pool.length)];
}

/** هل المركز من المراكز المعروفة؟ (بتتستخدم في اختبارات سلامة البيانات) */
export function isValidPosition(position) {
  return POSITIONS.includes(position);
}
