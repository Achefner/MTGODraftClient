import { useEffect, useState } from 'react';
import './App.css';
import { fetchSources, pickCard, saveDeck, startDraft } from './api/draftApi';
import DraftStatus, { PACK_SIZE, ROUNDS } from './components/DraftStatus';
import DraftSummary from './components/DraftSummary';
import Pack from './components/Pack';
import Picks from './components/Picks';
import StartScreen from './components/StartScreen';

const TOTAL_PICKS = ROUNDS * PACK_SIZE;

export default function App() {
  const [sources, setSources] = useState([]);
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchSources()
      .then((list) => {
        if (!cancelled) setSources(list);
      })
      .catch(() => {
        // No cube list: random drafts still work.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const run = async (action) => {
    setBusy(true);
    setError(null);
    try {
      setDraft(await action());
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleStart = (source) => run(() => startDraft(source));
  const handlePick = (cardName) => run(() => pickCard(draft.id, cardName));
  const handleSave = (name) => saveDeck(draft.id, name);
  const handleRestart = () => {
    setDraft(null);
    setError(null);
  };

  return (
    <main className="app">
      <header className="app__header">
        <h1>MTGO Draft</h1>
        {draft && !draft.finished && <DraftStatus draft={draft} />}
      </header>

      {error && <p role="alert" className="app__alert">{error}</p>}

      {!draft && <StartScreen sources={sources} onStart={handleStart} disabled={busy} />}

      {draft && draft.finished && <DraftSummary picks={draft.picks} onSave={handleSave} onRestart={handleRestart} />}

      {draft && !draft.finished && (
        <div className="draft">
          <Pack cards={draft.pack} onPick={handlePick} disabled={busy} />
          <Picks picks={draft.picks} total={TOTAL_PICKS} />
        </div>
      )}
    </main>
  );
}
