import { useEffect, useId, useState } from 'react';
import { useCardZoom } from './cardZoomContext';

export const CARD_BACK_PLACEHOLDER = '/card-back.svg';

/**
 * A card picture; falls back to the card back with the name printed over it. Hovering shows it
 * big; the zoom goes away when the cursor leaves, a drag starts, or the card itself goes away
 * (a picked card disappears under a still cursor).
 */
export default function CardImage({ card }) {
  const [broken, setBroken] = useState(false);
  const { show, release } = useCardZoom();
  const owner = useId();
  useEffect(() => () => release(owner), [owner, release]);

  const showPlaceholder = broken || !card.imageUrl;
  const follow = showPlaceholder ? undefined : (event) => show(owner, card, { x: event.clientX, y: event.clientY });
  const stop = () => release(owner);
  return (
    <figure className="card-image">
      <img
        src={showPlaceholder ? CARD_BACK_PLACEHOLDER : card.imageUrl}
        alt={card.name}
        loading="lazy"
        onError={() => setBroken(true)}
        onMouseEnter={follow}
        onMouseMove={follow}
        onMouseLeave={stop}
        onDragStart={stop}
      />
      {showPlaceholder && <figcaption className="card-image__name">{card.name}</figcaption>}
    </figure>
  );
}
