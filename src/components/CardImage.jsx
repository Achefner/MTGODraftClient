import { useState } from 'react';

export const CARD_BACK_PLACEHOLDER = '/card-back.svg';

/** A card picture; falls back to the card back with the name printed over it. */
export default function CardImage({ card }) {
  const [broken, setBroken] = useState(false);
  const showPlaceholder = broken || !card.imageUrl;
  return (
    <figure className="card-image">
      <img
        src={showPlaceholder ? CARD_BACK_PLACEHOLDER : card.imageUrl}
        alt={card.name}
        loading="lazy"
        onError={() => setBroken(true)}
      />
      {showPlaceholder && <figcaption className="card-image__name">{card.name}</figcaption>}
    </figure>
  );
}
