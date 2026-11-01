import { useState } from 'react';
import PickColumns from './PickColumns';
import { loadPickLayout, savePickLayout } from '../domain/session';

/** The player's picks in draggable columns; the arrangement is kept in the browser for the draft. */
export default function DraftPicks({ draftId, picks, total, title }) {
  const [layout, setLayout] = useState(() => loadPickLayout(draftId));
  const move = (next) => {
    setLayout(next);
    savePickLayout(draftId, next);
  };
  return <PickColumns picks={picks} total={total} title={title} layout={layout} onMove={move} />;
}
