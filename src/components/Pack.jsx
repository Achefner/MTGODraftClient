import CardImage from './CardImage';

/** The pack in front of the player: click a card to pick it. */
export default function Pack({ cards, onPick, disabled = false }) {
  if (cards.length === 0) return <p className="pack__empty">No cards left in this pack.</p>;
  return (
    <ul className="pack" aria-label="Your pack">
      {cards.map((card) => (
        <li key={card.name}>
          <button type="button" className="pack__card" aria-label={`Pick ${card.name}`} disabled={disabled} onClick={() => onPick(card.name)}>
            <CardImage card={card} />
          </button>
        </li>
      ))}
    </ul>
  );
}
