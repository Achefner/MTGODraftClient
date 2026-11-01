import { useState } from 'react';
import DraftPicks from './DraftPicks';

/** End of the draft: the picks, a form to save them as a deck, and a restart button. */
export default function DraftSummary({ draftId, picks, onSave, onRestart }) {
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    setError(null);
    try {
      setSaved(await onSave(trimmed));
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="summary">
      <h2>Draft complete!</h2>
      <p>You picked {picks.length} cards.</p>
      <form className="summary__save" onSubmit={handleSave}>
        <label htmlFor="deck-name">Deck name</label>
        <input id="deck-name" type="text" value={name} onChange={(event) => setName(event.target.value)} disabled={saving || saved !== null} />
        <button type="submit" disabled={saving || saved !== null}>Save deck</button>
        <button type="button" onClick={onRestart}>New draft</button>
      </form>
      {saved && <p className="summary__saved">Saved as "{saved.name}" ({saved.cardCount} cards) in the card database.</p>}
      {error && <p role="alert" className="app__alert">{error}</p>}
      <DraftPicks draftId={draftId} picks={picks} title="Your deck" />
    </section>
  );
}
