import { useEffect, useState } from 'react';
import './App.css';
import {
  act, fetchFormats, fetchSources, getDraft, joinTable, openTable, previewTable, saveDeck, startTable, streamUrl,
} from './api/draftApi';
import { openStream } from './api/draftStream';
import { CardZoomProvider } from './components/CardZoom';
import ConnectionStatus from './components/ConnectionStatus';
import DraftLog from './components/DraftLog';
import DraftStatus from './components/DraftStatus';
import DraftSummary from './components/DraftSummary';
import JoinScreen from './components/JoinScreen';
import Lobby from './components/Lobby';
import Pack from './components/Pack';
import PickClock from './components/PickClock';
import PickColumns from './components/PickColumns';
import SeatList from './components/SeatList';
import StartScreen from './components/StartScreen';
import WinstonTable from './components/WinstonTable';
import { DEFAULT_FORMATS, totalPicks } from './domain/formats';
import { latestView } from './domain/latestView';
import { clearSession, joinIdFromUrl, joinLink, loadSession, saveSession } from './domain/session';

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
const SEAT_LOST = [403, 404];

const initialJoinId = () => joinIdFromUrl(window.location.search);
const clearJoinFromUrl = () => window.history.replaceState({}, '', window.location.pathname);

export default function App() {
  const formats = useList(fetchFormats, DEFAULT_FORMATS);
  const sources = useList(fetchSources, NO_CUBES);
  const [joinId, setJoinId] = useState(initialJoinId);
  const [preview, setPreview] = useState(null);
  const [session, setSession] = useState(() => (initialJoinId() ? null : loadSession()));
  const [resuming] = useState(() => (initialJoinId() ? null : loadSession()));
  const [view, setView] = useState(null);
  const [connection, setConnection] = useState('connected');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const receive = (incoming) => setView((current) => latestView(current, { ...incoming, receivedAt: Date.now() }));

  const forgetSeat = () => {
    clearSession();
    setSession(null);
    setView(null);
  };

  // Coming back after a reload: check that the stored seat still exists.
  useEffect(() => {
    if (!resuming) return undefined;
    let cancelled = false;
    getDraft(resuming.draftId, resuming.token)
      .then((loaded) => {
        if (!cancelled) setView((current) => latestView(current, { ...loaded, receivedAt: Date.now() }));
      })
      .catch((e) => {
        if (cancelled) return;
        if (SEAT_LOST.includes(e.status)) {
          clearSession();
          setSession(null);
          setView(null);
        } else {
          setError(e.message);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [resuming]);

  // The invite link's table.
  useEffect(() => {
    if (!joinId) return undefined;
    let cancelled = false;
    previewTable(joinId)
      .then((loaded) => {
        if (!cancelled) setPreview(loaded);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [joinId]);

  // Live updates for the seat; the browser reconnects by itself after a drop.
  useEffect(() => {
    if (!session) return undefined;
    return openStream(streamUrl(session.draftId, session.token), {
      onUpdate: (update) => setView((current) => latestView(current, { ...update.view, receivedAt: Date.now() })),
      onStatus: setConnection,
    });
  }, [session]);

  const run = async (task) => {
    setBusy(true);
    setError(null);
    try {
      await task();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const enter = (ticket) => {
    const seat = { draftId: ticket.draftId, token: ticket.token, seat: ticket.seat };
    saveSession(seat);
    setSession(seat);
    receive(ticket.view);
  };

  const handleStart = (request) => run(async () => enter(await openTable(request)));

  const handleJoin = (name) => run(async () => {
    const ticket = await joinTable(joinId, name);
    clearJoinFromUrl();
    setJoinId(null);
    enter(ticket);
  });

  const handleCancelJoin = () => {
    clearJoinFromUrl();
    setJoinId(null);
    setPreview(null);
    setError(null);
  };

  const handleHostStart = () => run(async () => receive(await startTable(session.draftId, session.token)));

  /** Every action says which move it was meant for; when the view was out of date, reload it. */
  const play = (action) => run(async () => {
    try {
      receive(await act(session.draftId, session.token, { ...action, expectedMoves: view.moves }));
    } catch (e) {
      if (e.status === 409) receive(await getDraft(session.draftId, session.token));
      throw e;
    }
  });

  const handleSave = (name) => saveDeck(session.draftId, session.token, name);

  const handleLeave = () => {
    forgetSeat();
    setError(null);
  };

  const playing = view?.status === 'RUNNING';

  return (
    <CardZoomProvider>
      <main className="app">
        <header className="app__header">
          <h1>MTGO Draft</h1>
          {playing && <DraftStatus draft={view} />}
          {playing && view.timer && <PickClock timer={view.timer} receivedAt={view.receivedAt} />}
        </header>

        {session && <ConnectionStatus status={connection} />}
        {error && <p role="alert" className="app__alert">{error}</p>}

        {!session && joinId && <JoinScreen preview={preview} onJoin={handleJoin} onCancel={handleCancelJoin} disabled={busy} />}
        {!session && !joinId && <StartScreen formats={formats} sources={sources} onStart={handleStart} disabled={busy} />}
        {session && !view && <p>Loading your draft…</p>}

        {view?.status === 'LOBBY' && (
          <Lobby view={view} link={joinLink(window.location.origin, view.id)} onStart={handleHostStart} onLeave={handleLeave} disabled={busy} />
        )}

        {view?.status === 'FINISHED' && <DraftSummary picks={view.picks} onSave={handleSave} onRestart={handleLeave} />}

        {playing && (
          <div className="draft">
            <div className="draft__main">
              {view.format === 'WINSTON' ? (
                <WinstonTable draft={view} onTake={() => play({ type: 'TAKE_PILE' })} onPass={() => play({ type: 'PASS_PILE' })} disabled={busy} />
              ) : (
                <Pack cards={view.pack} onPick={(cardName) => play({ type: 'PICK', cardName })} disabled={busy || !view.yourTurn}
                  label={view.format === 'ROCHESTER' ? 'Table' : 'Your pack'} />
              )}
              {view.format !== 'CLASSIC' && <DraftLog draft={view} />}
            </div>
            <aside className="draft__side">
              <SeatList draft={view} />
            </aside>
            <div className="draft__picks">
              <PickColumns picks={view.picks} total={totalPicks(view.format)} />
            </div>
          </div>
        )}
      </main>
    </CardZoomProvider>
  );
}
