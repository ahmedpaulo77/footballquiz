import { describe, expect, it } from 'vitest';
import { QUIZZES, getQuiz, pickQuestion } from './quizzes.js';

describe('الألعاب (Quizzes)', () => {
  it('فيه لعبة «من أنا؟» و«المسار»', () => {
    const ids = QUIZZES.map((quiz) => quiz.id);
    expect(ids).toContain('who-am-i');
    expect(ids).toContain('paths');
  });

  it('«من أنا؟» الأول و«المسار» بعده', () => {
    expect(QUIZZES[0].id).toBe('who-am-i');
    expect(QUIZZES[1].id).toBe('paths');
  });

  it('كل لعبة عندها أسئلة وبيانات عرض كاملة', () => {
    for (const quiz of QUIZZES) {
      expect(quiz.title, quiz.id).toBeTruthy();
      expect(quiz.nextLabel, quiz.id).toBeTruthy();
      expect(quiz.answerLabel, quiz.id).toBeTruthy();
      expect(quiz.questions.length, quiz.id).toBeGreaterThan(0);
    }
  });

  it('مفيش IDs مكررة جوه أي لعبة', () => {
    for (const quiz of QUIZZES) {
      const ids = quiz.questions.map((question) => question.id);
      expect(new Set(ids).size, quiz.id).toBe(ids.length);
    }
  });

  it('كل سؤال عنده إجابة نصية', () => {
    for (const quiz of QUIZZES) {
      for (const question of quiz.questions) {
        expect(question.answer, question.id).toBeTruthy();
        expect(typeof question.answer, question.id).toBe('string');
      }
    }
  });

  it('كل سؤال عنده تلميحات أو مسار أندية', () => {
    for (const quiz of QUIZZES) {
      for (const question of quiz.questions) {
        const hasClues = question.clues.length > 0;
        const hasPath = question.clubs.length > 0;
        expect(hasClues || hasPath, `${quiz.id}/${question.id}`).toBe(true);
      }
    }
  });
});

describe('لعبة «من أنا؟»', () => {
  const quiz = getQuiz('who-am-i');

  it('كل لاعب عنده ٣ تلميحات بالإجابة الصح', () => {
    expect(quiz.kind).toBe('clues');

    for (const question of quiz.questions) {
      expect(question.clues, question.id).toHaveLength(3);
      expect(question.answer, question.id).toBeTruthy();
    }
  });

  it('كل تلميح عنده عنوان ونص مفيد', () => {
    for (const question of quiz.questions) {
      for (const clue of question.clues) {
        expect(clue.label, question.id).toBeTruthy();
        expect(clue.text.length, question.id).toBeGreaterThan(20);
      }
    }
  });

  it('كل لاعب عنده سطور بيانات تحت الإجابة', () => {
    for (const question of quiz.questions) {
      expect(question.meta.length, question.id).toBeGreaterThan(0);
    }
  });

  it('مفيش تلميح بيحرق اسم اللاعب كامل', () => {
    for (const question of quiz.questions) {
      const text = question.clues.map((clue) => clue.text).join(' ');
      expect(text, question.id).not.toContain(question.answer);
    }
  });

  it('فيها ٩٠ لاعب على الأقل', () => {
    expect(quiz.questions.length).toBeGreaterThanOrEqual(90);
  });
});

describe('لعبة «المسار»', () => {
  const quiz = getQuiz('paths');

  it('فيها كل اللاعبين اللي في الملف', () => {
    expect(quiz.kind).toBe('path');
    expect(quiz.questions.length).toBeGreaterThanOrEqual(300);
  });

  it('كل مسار فيه أندية حقيقية ومفيش فراغات', () => {
    for (const question of quiz.questions) {
      expect(question.clubs.length, question.id).toBeGreaterThan(0);

      for (const club of question.clubs) {
        expect(club.trim(), question.id).not.toBe('');
        expect(club, question.id).not.toMatch(/\*/);
        expect(club, question.id).not.toMatch(/\(loan/i);
        expect(club.trim(), question.id).toBe(club);
      }
    }
  });

  it('مفيش نادي مكرر ورا نفسه في نفس المسار', () => {
    for (const question of quiz.questions) {
      for (let i = 1; i < question.clubs.length; i += 1) {
        expect(question.clubs[i], `${question.id}[${i}]`).not.toBe(question.clubs[i - 1]);
      }
    }
  });

  it('أرقام الإعارة بتشاور على أندية موجودة', () => {
    for (const question of quiz.questions) {
      for (const index of question.loans) {
        expect(index, question.id).toBeGreaterThanOrEqual(0);
        expect(index, question.id).toBeLessThan(question.clubs.length);
      }
    }
  });
});

describe('اختيار سؤال', () => {
  it('بيستبعد الأسئلة اللي ظهرت قبل كده', () => {
    const quiz = getQuiz('paths');
    const excluded = quiz.questions.slice(0, 50).map((question) => question.id);

    for (let i = 0; i < 30; i += 1) {
      const question = pickQuestion(quiz, { excludeIds: excluded });
      expect(excluded).not.toContain(question.id);
    }
  });

  it('لو كل الأسئلة مستبعدة بيرجع سؤال برضه', () => {
    const quiz = getQuiz('who-am-i');
    const excluded = quiz.questions.map((question) => question.id);
    const question = pickQuestion(quiz, { excludeIds: excluded });

    expect(question).toBeTruthy();
    expect(question.id).toBeTruthy();
  });
});
