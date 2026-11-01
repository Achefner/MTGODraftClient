import { useState } from 'react';
import { useCardZoom } from './cardZoomContext';

export const CARD_BACK_PLACEHOLDER = '/card-back.svg';

/** A card picture; falls back to the card back with the name printed over it. Hovering shows it big. */
export default function CardImage({ card }) {
  const [broken, setBroken] = useState(false);
  const zoom = useCardZoom();
  const showPlaceholder = broken || !card.imageUrl;
  const follow = showPlaceholder ? undefined : (event) => zoom.show(card, { x: event.clientX, y: event.clientY });
  return (
    <figure className="card-image">
      <img
        src={showPlaceholder ? CARD_BACK_PLACEHOLDER : card.imageUrl}
        alt={card.name}
        loading="lazy"
        onError={() => setBroken(true)}
        onMouseEnter={follow}
        onMouseMove={follow}
        onMouseLeave={showPlaceholder ? undefined : zoom.hide}
      />
      {showPlaceholder && <figcaption className="card-image__name">{card.name}</figcaption>}
    </figure>
  );
}
