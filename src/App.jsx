import { useCallback, useEffect, useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import ClueList from './components/ClueList.jsx';
import AnswerReveal from './components/AnswerReveal.jsx';
import HowToPlay from './components/HowToPlay.jsx';
import { buildClues, pickPlayer } from './lib/game.js';
import {
  cleanupLegacyStorage,
  hasSeenHelp,
  loadTheme,
  markHelpSeen,
  saveTheme,
} from './lib/storage.js';

/** آخر كام لاعب نستبعدهم عشان ميتكررش نفس اللاعب قريب. */
const RECENT_LIMIT = 10;

export default function App() {
  const [theme, setTheme] = useState(() => loadTheme());
  const [target, setTarget] = useState(() => pickPlayer());
  const [recentIds, setRecentIds] = useState([]);
  const [revealed, setRevealed] = useState(false);
  const [modal, setModal] = useState(() => (hasSeenHelp() ? null : 'help'));

  const clues = useMemo(() => buildClues(target), [target]);

  useEffect(() => {
    cleanupLegacyStorage();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    saveTheme(theme);
  }, [theme]);

  const nextPlayer = useCallback(() => {
    const excludeIds = [...recentIds, target.id];
    setTarget(pickPlayer({ excludeIds }));
    setRecentIds(excludeIds.slice(-RECENT_LIMIT));
    setRevealed(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [recentIds, target.id]);

  const toggleAnswer = useCallback(() => {
    setRevealed((current) => !current);
  }, []);

  function closeHelp() {
    markHelpSeen();
    setModal(null);
  }

  return (
    <div className="app">
      <div className="field-decor" aria-hidden="true">
        <span className="field-circle" />
        <span className="field-line" />
      </div>

      <Header
        theme={theme}
        onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
        onOpenHelp={() => setModal('help')}
      />

      <main className="stage">
        <div className="host-tip">
          <span className="host-tip-icon" aria-hidden="true">
            🎤
          </span>
          <div className="host-tip-text">
            <b>اقرأ التلميحات بالترتيب</b>
            <span>سيب الناس تخمّن… الإجابة مخفية تحت، تفتحها بس لما تحتاجها.</span>
          </div>
        </div>

        <ClueList clues={clues} />

        <AnswerReveal player={target} revealed={revealed} onToggle={toggleAnswer} />

        <div className="controls">
          <button type="button" className="primary-btn next-btn" onClick={nextPlayer}>
            <span aria-hidden="true">🎲</span>
            لاعب تاني
          </button>
        </div>

        <p className="controls-hint">لاعب جديد بتلميحاته على طول — من غير تحدي يومي ولا محاولات.</p>
      </main>

      <footer className="site-footer">
        <p>بيانات نصية فقط — بدون صور أو شعارات أندية.</p>
        <p>من أنا؟ © 2026</p>
      </footer>

      <HowToPlay open={modal === 'help'} onClose={closeHelp} />
    </div>
  );
}
