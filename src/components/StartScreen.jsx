import { useState } from 'react';
import { findFormat } from '../domain/formats';

const RANDOM = 'random';

/** Choose a format and a card pool (random cards or a cube) and start a draft. */
export default function StartScreen({ formats, sources, onStart, disabled = false }) {
  const [formatName, setFormatName] = useState(formats[0]?.name ?? 'CLASSIC');
  const [choice, setChoice] = useState(RANDOM);
  const format = findFormat(formats, formatName);
  const tooSmall = (cube) => cube.cardCount < format.cardsNeeded;

  const handleFormat = (name) => {
    setFormatName(name);
    const cube = sources.find((c) => c.id === choice);
    if (cube && cube.cardCount < findFormat(formats, name).cardsNeeded) setChoice(RANDOM);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onStart(choice === RANDOM
      ? { source: 'random', format: format.name }
      : { source: 'cube', collectionId: choice, format: format.name });
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

      <button type="submit" disabled={disabled}>Start draft</button>
      <p className="start-screen__rules">{format.description} The other seats pick at random.</p>
    </form>
  );
}
