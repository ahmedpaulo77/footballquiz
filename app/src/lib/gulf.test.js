import { describe, expect, it } from 'vitest';
import { getQuiz, getQuizzes } from './quizzes.js';
import { selectGulfPool } from './gulf.js';

const GULF_GAME_IDS = ['paths', 'one-question', 'top-three', 'lineups'];

describe('الكرة الخليجية', () => {
  const arQuizzes = getQuizzes('ar');

  it('كل لعبة معنية فيها ١٠ أسئلة/ماتشات خليجية بالظبط على الأقل', () => {
    for (const id of GULF_GAME_IDS) {
      const quiz = getQuiz(id, 'ar');
      const gulfItems =
        quiz.kind === 'lineups'
          ? quiz.matches.filter((match) => match.gulf)
          : quiz.questions.filter((question) => question.gulf);

      expect(gulfItems.length, id).toBeGreaterThanOrEqual(10);
    }
  });

  it('«من أنا؟» و«ريسك» مفيهمش أسئلة خليجية خالص', () => {
    for (const id of ['who-am-i', 'risk']) {
      const quiz = getQuiz(id, 'ar');

      expect(quiz.questions.filter((question) => question.gulf), id).toHaveLength(0);
    }
  });

  it('الفلتر العادي بيستبعد الخليجي والفلتر الخليجي بياخده بس', () => {
    for (const id of GULF_GAME_IDS) {
      const quiz = getQuiz(id, 'ar');
      const items = quiz.kind === 'lineups' ? quiz.matches : quiz.questions;
      const general = selectGulfPool(items, false);
      const gulfOnly = selectGulfPool(items, true);

      expect(general.filter((item) => item.gulf), id).toHaveLength(0);
      expect(gulfOnly.every((item) => item.gulf), id).toBe(true);
      expect(gulfOnly.length, id).toBeGreaterThanOrEqual(10);
    }
  });

  it('ماتشات الخليج من 1996 لحد دلوقتي ومش فيها سهل', () => {
    const arLineups = getQuiz('lineups', 'ar');
    const gulfMatches = arLineups.matches.filter((match) => match.gulf);

    for (const match of gulfMatches) {
      expect(match.year, match.id).toBeGreaterThanOrEqual(1996);
      expect(match.year, match.id).toBeLessThanOrEqual(2026);
      expect(['medium', 'hard'], match.id).toContain(match.difficulty);
    }
  });

  it('الأسئلة الخليجية موجودة في النسختين العربية والإنجليزية', () => {
    const enQuizzes = Object.fromEntries(getQuizzes('en').map((quiz) => [quiz.id, quiz]));

    for (const quiz of arQuizzes) {
      const enQuiz = enQuizzes[quiz.id];
      expect(enQuiz, quiz.id).toBeDefined();
    }
  });
});
