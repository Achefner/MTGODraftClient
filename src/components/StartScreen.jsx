import { useState } from 'react';

export const CARDS_NEEDED = 360;
const RANDOM = 'random';

/** Choose a card pool (random cards or a cube) and start a draft. */
export default function StartScreen({ sources, onStart, disabled = false }) {
  const [choice, setChoice] = useState(RANDOM);

  const handleSubmit = (event) => {
    event.preventDefault();
    onStart(choice === RANDOM ? { source: 'random' } : { source: 'cube', collectionId: choice });
  };

  return (
    <form className="start-screen" onSubmit={handleSubmit}>
      <label htmlFor="source-select">Card pool</label>
      <select id="source-select" value={choice} onChange={(event) => setChoice(event.target.value)} disabled={disabled}>
        <option value={RANDOM}>Random cards from the database</option>
        {sources.map((cube) => (
          <option key={cube.id} value={cube.id} disabled={cube.cardCount < CARDS_NEEDED}>
            {cube.name} ({cube.cardCount} cards{cube.cardCount < CARDS_NEEDED ? `, needs ${CARDS_NEEDED}` : ''})
          </option>
        ))}
      </select>
      <button type="submit" disabled={disabled}>Start draft</button>
      <p className="start-screen__rules">8 players, 3 packs of 15 cards. Packs pass left, then right, then left. The seven other seats pick at random.</p>
    </form>
  );
}
