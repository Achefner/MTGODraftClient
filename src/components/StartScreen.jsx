import { useState } from 'react';
import { findFormat } from '../domain/formats';

const RANDOM = 'random';

/**
 * Choose a format, a card pool, a name and the pick timer, then draft against bots at once or
 * open a table for friends to join.
 */
export default function StartScreen({ formats, sources, onStart, disabled = false }) {
  const [formatName, setFormatName] = useState(formats[0]?.name ?? 'CLASSIC');
  const [choice, setChoice] = useState(RANDOM);
  const [playerName, setPlayerName] = useState('');
  const [timed, setTimed] = useState(true);
  const format = findFormat(formats, formatName);
  const tooSmall = (cube) => cube.cardCount < format.cardsNeeded;

  const handleFormat = (name) => {
    setFormatName(name);
    const cube = sources.find((c) => c.id === choice);
    if (cube && cube.cardCount < findFormat(formats, name).cardsNeeded) setChoice(RANDOM);
  };

  const start = (startNow) => {
    const pool = choice === RANDOM ? { source: 'random' } : { source: 'cube', collectionId: choice };
    onStart({ ...pool, format: format.name, playerName: playerName.trim(), timed, startNow });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    start(true);
  };

  return (
    <form className="start-screen" onSubmit={handleSubmit}>
      <label htmlFor="format-select">Format</label>
      <select id="format-select" value={format.name} onChange={(event) => handleFormat(event.target.value)} disabled={disabled}>
        {formats.map((f) => <option key={f.name} value={f.name}>{f.displayName}</option>)}
      </select>

      <label htmlFor="source-select">Card pool</label>
      <select id="source-select" value={choice} onChange={(event) => setChoice(event.target.value)} disabled={disabled}>
        <option value={RANDOM}>Random cards from the database</option>
        {sources.map((cube) => (
          <option key={cube.id} value={cube.id} disabled={tooSmall(cube)}>
            {cube.name} ({cube.cardCount} cards{tooSmall(cube) ? `, needs ${format.cardsNeeded}` : ''})
          </option>
        ))}
      </select>

      <label htmlFor="player-name">Your name</label>
      <input id="player-name" type="text" maxLength={40} value={playerName} onChange={(event) => setPlayerName(event.target.value)} disabled={disabled} />

      <label className="start-screen__check">
        <input type="checkbox" checked={timed} onChange={(event) => setTimed(event.target.checked)} disabled={disabled} />
        Pick timer: a card is picked for you when time runs out
      </label>

      <div className="start-screen__buttons">
        <button type="submit" disabled={disabled}>Draft against bots</button>
        <button type="button" className="button--secondary" onClick={() => start(false)} disabled={disabled}>Open a table</button>
      </div>
      <p className="start-screen__rules">
        {format.description} Open a table to invite friends with a link; seats nobody takes are played by bots.
      </p>
    </form>
  );
}
