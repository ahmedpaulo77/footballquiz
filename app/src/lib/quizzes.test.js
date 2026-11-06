import { describe, expect, it } from 'vitest';
import { QUIZZES, getQuiz, getQuizzes, pickQuestion } from './quizzes.js';
import { findCell, isBoardComplete, pickCategories, scoreDelta, scoreLabel, swapCategory } from './risk.js';

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

  it('كل لعبة عندها محتوى وبيانات عرض كاملة في اللغتين', () => {
    for (const lang of ['ar', 'en']) {
      for (const quiz of getQuizzes(lang)) {
        expect(quiz.title, `${lang}/${quiz.id}`).toBeTruthy();
        expect(quiz.nextLabel, `${lang}/${quiz.id}`).toBeTruthy();
        expect(quiz.answerLabel, `${lang}/${quiz.id}`).toBeTruthy();
        expect(
          quiz.questions.length + quiz.matches.length,
          `${lang}/${quiz.id}`,
        ).toBeGreaterThan(0);
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
      if (quiz.kind === 'top3') continue;

      for (const question of quiz.questions) {
        expect(question.answer, question.id).toBeTruthy();
        expect(typeof question.answer, question.id).toBe('string');
      }
    }
  });

  it('كل سؤال عنده تلميحات أو مسار أندية أو سؤال ريسك أو ٤ اختيارات أو ٩ لاعبين', () => {
    for (const quiz of QUIZZES) {
      for (const question of quiz.questions) {
        const hasClues = question.clues.length > 0;
        const hasPath = question.clubs.length > 0;
        const hasRisk = quiz.kind === 'risk' && Boolean(question.question);
        const hasOptions =
          quiz.kind === 'points' &&
          question.options.length === 4 &&
          Boolean(question.question);
        const hasPlayers = quiz.kind === 'top3' && question.players.length === 9;
        expect(
          hasClues || hasPath || hasRisk || hasOptions || hasPlayers,
          `${quiz.id}/${question.id}`,
        ).toBe(true);
      }
    }
  });
});

describe('لعبة «من أنا؟»', () => {
  const arQuiz = getQuiz('who-am-i', 'ar');
  const enQuiz = getQuiz('who-am-i', 'en');

  it('فيها الـ٣٩ لاعب بتوع ملف Clues', () => {
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

describe('لعبة «ريسك»', () => {
  const arQuiz = getQuiz('risk', 'ar');
  const enQuiz = getQuiz('risk', 'en');

  it('نوعها risk وبعد «المسار» في الترتيب', () => {
    expect(arQuiz.kind).toBe('risk');
    expect(arQuiz.order).toBe(3);
    expect(QUIZZES.map((quiz) => quiz.id)).toEqual([
      'who-am-i',
      'paths',
      'risk',
      'one-question',
      'top-three',
      'lineups',
    ]);
  });

  it('فيها ١٥ فئة و٦٠ خلية على ٤ قيم', () => {
    expect(arQuiz.categories).toHaveLength(15);
    expect(arQuiz.values).toEqual([10, 20, 40, 50]);
    expect(arQuiz.questions).toHaveLength(60);
    expect(enQuiz.questions).toHaveLength(60);
  });

  it('كل فئة عندها خلية واحدة لكل قيمة', () => {
    for (const category of arQuiz.categories) {
      const cells = arQuiz.questions.filter(
        (question) => question.category === category.id,
      );

      expect(cells, category.id).toHaveLength(arQuiz.values.length);
      expect(
        cells.map((cell) => cell.value).sort((a, b) => a - b),
        category.id,
      ).toEqual(arQuiz.values);
    }
  });

  it('كل خلية ليها id وقيمة فريدة ومفيش تكرار', () => {
    const ids = arQuiz.questions.map((question) => question.id);
    expect(new Set(ids).size).toBe(ids.length);

    const pairs = arQuiz.questions.map(
      (question) => `${question.category}:${question.value}`,
    );
    expect(new Set(pairs).size).toBe(pairs.length);
  });

  it('كل سؤال وإجابة موجودين بالعربي والإنجليزي', () => {
    arQuiz.questions.forEach((question, index) => {
      const english = enQuiz.questions[index];

      expect(question.question.length, question.id).toBeGreaterThan(10);
      expect(question.answer.length, question.id).toBeGreaterThan(2);
      expect(question.question, question.id).toMatch(ARABIC_LETTERS);
      expect(question.answer, question.id).toMatch(ARABIC_LETTERS);

      expect(english.id, question.id).toBe(question.id);
      expect(english.question.length, question.id).toBeGreaterThan(10);
      expect(english.answer.length, question.id).toBeGreaterThan(2);
      expect(english.question, question.id).toMatch(LATIN_LETTERS);
      expect(english.answer, question.id).toMatch(LATIN_LETTERS);
    });
  });

  it('عناوين الفئات مترجمة في اللغتين', () => {
    arQuiz.categories.forEach((category, index) => {
      const english = enQuiz.categories[index];

      expect(category.title, category.id).toMatch(ARABIC_LETTERS);
      expect(english.title, category.id).toMatch(LATIN_LETTERS);
    });
  });

  it('البحث عن خلية بالفئة والقيمة بيرجع الخلية الصح', () => {
    const cell = findCell(arQuiz.questions, 'africa', 50);

    expect(cell).toBeTruthy();
    expect(cell.category).toBe('africa');
    expect(cell.value).toBe(50);
    expect(findCell(arQuiz.questions, 'africa', 999)).toBeNull();
  });
});

describe('نقاط لعبة «ريسك»', () => {
  it('صح عادي = قيمة الخلية', () => {
    expect(scoreDelta({ value: 20, correct: true })).toBe(20);
  });

  it('صح على خلية الدبل = ضعف قيمة الخلية أوتوماتيك', () => {
    expect(scoreDelta({ value: 20, double: true, correct: true })).toBe(40);
  });

  it('غلط عادي = صفر', () => {
    expect(scoreDelta({ value: 20, correct: false })).toBe(0);
  });

  it('غلط على خلية الدبل = صفر', () => {
    expect(scoreDelta({ value: 20, double: true, correct: false })).toBe(0);
  });

  it('شكل النقاط بيتعرض بالإشارة الصح', () => {
    expect(scoreLabel(60)).toBe('+60');
    expect(scoreLabel(-30)).toBe('−30');
    expect(scoreLabel(0)).toBe('0');
  });

  it('اللوحة بتخلص لما كل الخلايا تتلعب', () => {
    const questions = getQuiz('risk').questions;
    const all = new Set(questions.map((question) => question.id));

    expect(isBoardComplete(questions, all)).toBe(true);
    expect(isBoardComplete(questions, new Set())).toBe(false);
  });

  it('بيختار ٤ فئات عشوائية من غير تكرار', () => {
    const categories = getQuiz('risk').categories;
    const picked = pickCategories(categories, 4);

    expect(picked).toHaveLength(4);
    expect(new Set(picked.map((category) => category.id)).size).toBe(4);
    for (const category of picked) expect(categories).toContainEqual(category);
  });

  it('اختيار الفئات بيحترم عدد الفئات المتاح', () => {
    const categories = getQuiz('risk').categories.slice(0, 2);

    expect(pickCategories(categories, 4)).toHaveLength(2);
    expect(pickCategories(categories, 0)).toEqual([]);
    expect(pickCategories(null, 4)).toEqual([]);
  });

  it('التبديل بيجيب فئة مش ظاهرة على اللوحة', () => {
    const categories = getQuiz('risk').categories;
    const shown = categories.slice(0, 4).map((category) => category.id);
    const next = swapCategory(categories, shown, () => 0);

    expect(next).toBeTruthy();
    expect(shown).not.toContain(next.id);
  });

  it('التبديل بيرجع null لو كل الفئات ظاهرة', () => {
    const categories = getQuiz('risk').categories;
    const shown = categories.map((category) => category.id);

    expect(swapCategory(categories, shown)).toBeNull();
  });
});

describe('لعبة «سؤال واحد»', () => {
  const arQuiz = getQuiz('one-question', 'ar');
  const enQuiz = getQuiz('one-question', 'en');

  it('نوعها points وبعد «ريسك» في الترتيب', () => {
    expect(arQuiz.kind).toBe('points');
    expect(arQuiz.order).toBe(4);
    expect(QUIZZES[3].id).toBe('one-question');
  });

  it('فيها ٦٠ سؤال و١٠ أسئلة في الجولة و١٠ نقط للسؤال', () => {
    expect(arQuiz.questions).toHaveLength(60);
    expect(enQuiz.questions).toHaveLength(60);
    expect(arQuiz.questionsPerGame).toBe(10);
    expect(arQuiz.pointsPerQuestion).toBe(10);
  });

  it('كل سؤال عنده ٤ اختيارات مختلفة وإجابة صح واحدة', () => {
    for (const question of arQuiz.questions) {
      expect(question.options, question.id).toHaveLength(4);
      expect(new Set(question.options).size, question.id).toBe(4);
      expect(question.correct, question.id).toBeGreaterThanOrEqual(0);
      expect(question.correct, question.id).toBeLessThan(4);
      expect(question.answer, question.id).toBe(question.options[question.correct]);
    }
  });

  it('الأسئلة والاختيارات مترجمة للعربي والإنجليزي', () => {
    arQuiz.questions.forEach((question, index) => {
      const english = enQuiz.questions[index];

      expect(english.id, question.id).toBe(question.id);
      expect(question.question, question.id).toMatch(ARABIC_LETTERS);
      expect(english.question, question.id).toMatch(LATIN_LETTERS);
      expect(question.question.length, question.id).toBeGreaterThan(10);
      expect(english.question.length, question.id).toBeGreaterThan(10);

      question.options.forEach((option, optionIndex) => {
        expect(option, question.id).toMatch(ARABIC_LETTERS);
        expect(english.options[optionIndex], question.id).toMatch(/[A-Za-z0-9]/);
      });

      expect(english.correct, question.id).toBe(question.correct);
    });
  });

  it('الإجابة الصح مش دايمًا في نفس الاختيار', () => {
    const counts = [0, 0, 0, 0];

    for (const question of arQuiz.questions) {
      counts[question.correct] += 1;
    }

    for (const count of counts) {
      expect(count).toBeGreaterThan(5);
    }
  });
});

describe('لعبة «توب 3»', () => {
  const arQuiz = getQuiz('top-three', 'ar');
  const enQuiz = getQuiz('top-three', 'en');

  it('نوعها top3 وآخر لعبة في الترتيب', () => {
    expect(arQuiz.kind).toBe('top3');
    expect(arQuiz.order).toBe(5);
    expect(QUIZZES[4].id).toBe('top-three');
  });

  it('فيها ٥٠ سؤال و٨ أسئلة في الجولة و٣ اختيارات', () => {
    expect(arQuiz.questions).toHaveLength(50);
    expect(enQuiz.questions).toHaveLength(50);
    expect(arQuiz.questionsPerGame).toBe(8);
    expect(arQuiz.picksCount).toBe(3);
  });

  it('كل سؤال فيه ٩ لاعبين و٣ إجابات صح', () => {
    for (const question of arQuiz.questions) {
      expect(question.players, question.id).toHaveLength(9);
      expect(question.top, question.id).toHaveLength(3);
      expect(new Set(question.top).size, question.id).toBe(3);

      const names = question.players.map((player) => player.name);
      expect(new Set(names).size, question.id).toBe(9);

      for (const player of question.players) {
        expect(player.name.trim(), question.id).not.toBe('');
        expect(Number.isInteger(player.stat), `${question.id}/${player.name}`).toBe(true);
        expect(player.stat, `${question.id}/${player.name}`).toBeGreaterThan(0);
      }
    }
  });

  it('الإجابات الصح هي أعلى ٣ أرقام ومفيش تعادل على الحد', () => {
    for (const question of arQuiz.questions) {
      const sorted = [...question.players]
        .map((player, index) => ({ index, stat: player.stat }))
        .sort((a, b) => b.stat - a.stat || a.index - b.index);

      expect(
        sorted.slice(0, 3).map((entry) => entry.index).sort((a, b) => a - b),
        question.id,
      ).toEqual([...question.top].sort((a, b) => a - b));

      expect(sorted[2].stat, question.id).toBeGreaterThan(sorted[3].stat);
    }
  });

  it('الأسئلة والفئات والوحدات مترجمة للعربي والإنجليزي', () => {
    arQuiz.questions.forEach((question, index) => {
      const english = enQuiz.questions[index];

      expect(question.id, question.id).toBe(english.id);
      expect(question.question, question.id).toMatch(ARABIC_LETTERS);
      expect(english.question, question.id).toMatch(LATIN_LETTERS);
      expect(question.category, question.id).toMatch(ARABIC_LETTERS);
      expect(english.category, question.id).toMatch(LATIN_LETTERS);
      expect(question.unit, question.id).toMatch(ARABIC_LETTERS);
      expect(english.unit, question.id).toMatch(LATIN_LETTERS);

      expect(question.players.map((player) => player.name)).toEqual(
        english.players.map((player) => player.name),
      );
      expect(question.players.map((player) => player.stat)).toEqual(
        english.players.map((player) => player.stat),
      );
      expect(question.top).toEqual(english.top);
    });
  });

  it('الإجابات مش دايمًا أول ٣ كروت', () => {
    const firstThree = arQuiz.questions.filter(
      (question) => question.top.join(',') === '0,1,2',
    );

    expect(firstThree.length).toBeLessThan(10);
  });
});

describe('لعبة «تشكيلات المباريات»', () => {
  const arQuiz = getQuiz('lineups', 'ar');
  const enQuiz = getQuiz('lineups', 'en');

  it('نوعها lineups وآخر لعبة في الترتيب', () => {
    expect(arQuiz.kind).toBe('lineups');
    expect(arQuiz.order).toBe(6);
    expect(QUIZZES[5].id).toBe('lineups');
  });

  it('فيها ٦٦ ماتش و١٠ مسابقات كلها مستخدمة', () => {
    expect(arQuiz.matches).toHaveLength(66);
    expect(enQuiz.matches).toHaveLength(66);
    expect(arQuiz.competitions).toHaveLength(10);
    expect(new Set(arQuiz.matches.map((match) => match.competition)).size).toBe(10);

    for (const competition of arQuiz.competitions) {
      expect(competition.title, competition.id).toMatch(ARABIC_LETTERS);
      expect(
        arQuiz.matches.some((match) => match.competition === competition.id),
        competition.id,
      ).toBe(true);
    }
  });

  it('كل ماتش عنده فريقين وسنة ونتيجة وصعوبة معروفة', () => {
    const levels = ['easy', 'medium', 'hard'];
    const counts = { easy: 0, medium: 0, hard: 0 };

    for (const match of arQuiz.matches) {
      expect(match.home, match.id).toMatch(ARABIC_LETTERS);
      expect(match.away, match.id).toMatch(ARABIC_LETTERS);
      expect(match.home, match.id).not.toBe(match.away);
      expect(match.competitionTitle, match.id).toMatch(ARABIC_LETTERS);
      expect(match.year, match.id).toBeGreaterThanOrEqual(1960);
      expect(match.year, match.id).toBeLessThanOrEqual(2026);
      expect(match.score, match.id).toMatch(/\d/);
      expect(levels, match.id).toContain(match.difficulty);
      expect(['home', 'away'], match.id).toContain(match.winner);
      expect(['regulation', 'extra-time', 'golden-goal', 'penalties'], match.id).toContain(
        match.decidedBy,
      );

      counts[match.difficulty] += 1;
    }

    for (const level of levels) {
      expect(counts[level], level).toBeGreaterThan(5);
    }
  });

  it('كل فريق ١١ لاعب أساسي بحارس واحد ومفيش تكرار', () => {
    for (const match of arQuiz.matches) {
      for (const side of ['homeLineup', 'awayLineup']) {
        const lineup = match[side];

        expect(lineup, `${match.id}/${side}`).toHaveLength(11);
        expect(
          lineup.filter((player) => player.group === 'GK'),
          `${match.id}/${side}`,
        ).toHaveLength(1);
        expect(
          new Set(lineup.map((player) => player.name)).size,
          `${match.id}/${side}`,
        ).toBe(11);

        for (const player of lineup) {
          expect(['GK', 'DF', 'MF', 'FW'], `${match.id}/${player.id}`).toContain(
            player.group,
          );
          expect(player.pos, `${match.id}/${player.id}`).toBeTruthy();
          expect(player.name, `${match.id}/${player.id}`).toMatch(ARABIC_LETTERS);
        }
      }

      const homeNames = match.homeLineup.map((player) => player.name);
      const awayNames = match.awayLineup.map((player) => player.name);

      for (const name of homeNames) {
        expect(awayNames, match.id).not.toContain(name);
      }
    }
  });

  it('التشكيلات كاملة بالعربي والإنجليزي', () => {
    arQuiz.matches.forEach((match, index) => {
      const english = enQuiz.matches[index];

      expect(english.id, match.id).toBe(match.id);
      expect(english.home, match.id).toMatch(LATIN_LETTERS);
      expect(english.away, match.id).toMatch(LATIN_LETTERS);
      expect(english.competitionTitle, match.id).toMatch(LATIN_LETTERS);
      expect(english.homeLineup, match.id).toHaveLength(11);
      expect(english.awayLineup, match.id).toHaveLength(11);

      for (const side of ['homeLineup', 'awayLineup']) {
        match[side].forEach((player, playerIndex) => {
          const translated = english[side][playerIndex];

          expect(translated.name, `${match.id}/${player.id}`).toMatch(LATIN_LETTERS);
          expect(translated.pos, `${match.id}/${player.id}`).toBe(player.pos);
          expect(translated.group, `${match.id}/${player.id}`).toBe(player.group);
        });
      }
    });
  });

  it('ركلات الترجيح موجودة بس في الماتشات اللي اتحسمت بيها', () => {
    for (const match of arQuiz.matches) {
      if (match.decidedBy === 'penalties') {
        expect(match.shootout, match.id).toMatch(/\d/);
      } else {
        expect(match.shootout, match.id).toBeNull();
      }
    }
  });

  it('كل ماتش ليه مصدر ويكيبيديا', () => {
    for (const match of arQuiz.matches) {
      expect(match.source, match.id).toMatch(/^https:\/\/en\.wikipedia\.org\//);
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
