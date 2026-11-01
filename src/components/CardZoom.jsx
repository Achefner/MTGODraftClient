import { useMemo, useState } from 'react';
import { zoomPosition, zoomSize } from '../domain/zoomPosition';
import { CardZoomContext } from './cardZoomContext';

/**
 * Holds the one zoomed card of the page and draws it over everything, next to the cursor.
 * The overlay ignores the mouse, so it never steals the hover from the card underneath.
 */
export function CardZoomProvider({ children }) {
  const [hovered, setHovered] = useState(null);
  const actions = useMemo(() => ({
    show: (owner, card, cursor) => setHovered({ owner, card, cursor, viewport: { width: window.innerWidth, height: window.innerHeight } }),
    release: (owner) => setHovered((current) => (current?.owner === owner ? null : current)),
  }), []);

  return (
    <CardZoomContext.Provider value={actions}>
      {children}
      {hovered && <ZoomedCard card={hovered.card} cursor={hovered.cursor} viewport={hovered.viewport} />}
    </CardZoomContext.Provider>
  );
}

function ZoomedCard({ card, cursor, viewport }) {
  const size = zoomSize(viewport);
  const { left, top } = zoomPosition(cursor, viewport, size);
  return (
    <div className="card-zoom" data-testid="card-zoom" aria-hidden="true" style={{ left, top, width: size.width, height: size.height }}>
      <img src={card.imageUrl} alt="" />
    </div>
  );
}
