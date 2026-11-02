import { describe, expect, it } from 'vitest';
import { QUIZZES, getQuiz, getQuizzes, pickQuestion } from './quizzes.js';

const ARABIC_LETTERS = /[\u0600-\u06FF]/;
const LATIN_LETTERS = /[A-Za-z]/;

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

  it('كل لعبة عندها أسئلة وبيانات عرض كاملة في اللغتين', () => {
    for (const lang of ['ar', 'en']) {
      for (const quiz of getQuizzes(lang)) {
        expect(quiz.title, `${lang}/${quiz.id}`).toBeTruthy();
        expect(quiz.nextLabel, `${lang}/${quiz.id}`).toBeTruthy();
        expect(quiz.answerLabel, `${lang}/${quiz.id}`).toBeTruthy();
        expect(quiz.questions.length, `${lang}/${quiz.id}`).toBeGreaterThan(0);
      }
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
  const arQuiz = getQuiz('who-am-i', 'ar');
  const enQuiz = getQuiz('who-am-i', 'en');

  it('فيها الـ٣٩ لاعب بتوع ملف Clues.xlsx', () => {
    expect(arQuiz.kind).toBe('clues');
    expect(arQuiz.questions).toHaveLength(39);
    expect(enQuiz.questions).toHaveLength(39);
  });

  it('كل لاعب عنده من ٥ لـ٩ تلميحات', () => {
    for (const question of arQuiz.questions) {
      expect(question.clues.length, question.id).toBeGreaterThanOrEqual(5);
      expect(question.clues.length, question.id).toBeLessThanOrEqual(9);
    }
  });

  it('نفس عدد التلميحات بالعربي والإنجليزي بنفس الترتيب', () => {
    arQuiz.questions.forEach((question, index) => {
      const english = enQuiz.questions[index];

      expect(english.id, question.id).toBe(question.id);
      expect(english.clues.length, question.id).toBe(question.clues.length);
      expect(english.answer, question.id).toBeTruthy();
    });
  });

  it('كل تلميح عربي فيه حروف عربية ومفيد', () => {
    for (const question of arQuiz.questions) {
      for (const clue of question.clues) {
        expect(clue.text.length, question.id).toBeGreaterThan(10);
        expect(clue.text, question.id).toMatch(ARABIC_LETTERS);
      }
    }
  });

  it('كل تلميح إنجليزي فيه حروف لاتينية ومفيد', () => {
    for (const question of enQuiz.questions) {
      for (const clue of question.clues) {
        expect(clue.text.length, question.id).toBeGreaterThan(10);
        expect(clue.text, question.id).toMatch(LATIN_LETTERS);
      }
    }
  });

  it('أسماء اللاعبين بالعربي مختلفة عن الإنجليزي', () => {
    arQuiz.questions.forEach((question, index) => {
      const english = enQuiz.questions[index];
      expect(question.answer, question.id).toMatch(ARABIC_LETTERS);
      expect(english.answer, question.id).toMatch(LATIN_LETTERS);
    });
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

describe('اللغتين', () => {
  it('عنوان «المسار» بيتغير مع اللغة', () => {
    expect(getQuiz('paths', 'ar').title).toBe('المسار');
    expect(getQuiz('paths', 'en').title).toBe('The Path');
  });

  it('صفحة إنجليزية كلها نصوص إنجليزية', () => {
    for (const quiz of getQuizzes('en')) {
      expect(quiz.title, quiz.id).toMatch(LATIN_LETTERS);
      expect(quiz.subtitle, quiz.id).toMatch(LATIN_LETTERS);
      expect(quiz.nextLabel, quiz.id).toMatch(LATIN_LETTERS);
    }
  });

  it('لو اللغة مش معروفة بيرجع العربي', () => {
    expect(getQuiz('who-am-i', 'fr').title).toBe('من أنا؟');
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
