import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

/**
 * كل لعبة ليها صفحة HTML مستقلة.
 * main.jsx?quiz=risk → بيعرض لعبة ريسك
 * main.jsx بدون باراميتر → بيعرض الصفحة الرئيسية (من أنا؟)
 */
function getQuizId() {
  // بيقرأ اسم اللعبة من query string في الـ script tag
  const scripts = document.querySelectorAll('script[src]');
  for (const script of scripts) {
    const url = new URL(script.src, location.href);
    const quiz = url.searchParams.get('quiz');
    if (quiz) return quiz;
  }
  return 'who-am-i';
}

const quizId = getQuizId();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App initialQuizId={quizId} />
  </StrictMode>,
);
