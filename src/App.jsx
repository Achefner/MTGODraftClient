import { useEffect, useState } from 'react';
import './App.css';
import { act, fetchFormats, fetchSources, saveDeck, startDraft } from './api/draftApi';
import DraftLog from './components/DraftLog';
import DraftStatus from './components/DraftStatus';
import DraftSummary from './components/DraftSummary';
import Pack from './components/Pack';
import Picks from './components/Picks';
import StartScreen from './components/StartScreen';
import WinstonTable from './components/WinstonTable';
import { DEFAULT_FORMATS, totalPicks } from './domain/formats';

/** Loads a list once; keeps the fallback when it cannot be loaded. */
function useList(load, fallback) {
  const [list, setList] = useState(fallback);
  useEffect(() => {
    let cancelled = false;
    load()
      .then((loaded) => {
        if (!cancelled) setList(loaded);
      })
      .catch(() => {
        // keep the fallback
      });
    return () => {
      cancelled = true;
    };
  }, [load]);
  return list;
}

const NO_CUBES = [];

export default function App() {
  const formats = useList(fetchFormats, DEFAULT_FORMATS);
  const sources = useList(fetchSources, NO_CUBES);
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

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

  const handleStart = (request) => run(() => startDraft(request));
  const handlePick = (cardName) => run(() => act(draft.id, { type: 'PICK', cardName }));
  const handleTake = () => run(() => act(draft.id, { type: 'TAKE_PILE' }));
  const handlePass = () => run(() => act(draft.id, { type: 'PASS_PILE' }));
  const handleSave = (name) => saveDeck(draft.id, name);
  const handleRestart = () => {
    setDraft(null);
    setError(null);
  };

  const playing = draft && !draft.finished;

  return (
    <main className="app">
      <header className="app__header">
        <h1>MTGO Draft</h1>
        {playing && <DraftStatus draft={draft} />}
      </header>

      {error && <p role="alert" className="app__alert">{error}</p>}

      {!draft && <StartScreen formats={formats} sources={sources} onStart={handleStart} disabled={busy} />}

      {draft && draft.finished && <DraftSummary picks={draft.picks} onSave={handleSave} onRestart={handleRestart} />}

      {playing && (
        <div className="draft">
          <div className="draft__main">
            {draft.format === 'WINSTON' ? (
              <WinstonTable draft={draft} onTake={handleTake} onPass={handlePass} disabled={busy} />
            ) : (
              <Pack cards={draft.pack} onPick={handlePick} disabled={busy || !draft.yourTurn}
                label={draft.format === 'ROCHESTER' ? 'Table' : 'Your pack'} />
            )}
            {draft.format !== 'CLASSIC' && <DraftLog draft={draft} />}
          </div>
          <Picks picks={draft.picks} total={totalPicks(draft.format)} />
        </div>
      )}
    </main>
  );
}
