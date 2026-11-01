import CardImage from './CardImage';
import { canPassPile } from '../domain/winston';

const CARD_BACK = '/card-back.svg';
const STACK_DEPTH = 3;
const cards = (n) => `${n} card${n === 1 ? '' : 's'}`;

function FaceDown({ count }) {
  return (
    <ul className="winston-pile__cards">
      {Array.from({ length: count }, (_, index) => (
        <li key={index}><img src={CARD_BACK} alt="" className="winston-pile__back" /></li>
      ))}
    </ul>
  );
}

/**
 * The Winston table: the three piles with all their cards and the stack. On the player's turn the
 * pile they are looking at is face up and taken by clicking it; the Skip button passes it.
 * Everything else is face down.
 */
export default function WinstonTable({ draft, onTake, onPass, disabled = false }) {
  const { pileSizes, currentPile, stackSize } = draft.winston;
  const lastPile = !pileSizes.slice(currentPile + 1).some((size) => size > 0);
  const pileNumber = currentPile + 1;

  return (
    <section className="winston">
      <div className="winston__table">
        {pileSizes.map((size, index) => {
          const faceUp = draft.yourTurn && index === currentPile;
          return (
            <section
              key={index}
              className={`winston-pile${faceUp ? ' winston-pile--current' : ''}`}
              aria-label={`Pile ${index + 1}`}
              aria-current={faceUp ? 'true' : undefined}
            >
              <h3>Pile {index + 1} · {cards(size)}</h3>
              {size === 0 && <p className="winston-pile__empty">Empty</p>}
              {size > 0 && faceUp && (
                <button
                  type="button"
                  className="winston-pile__take"
                  aria-label={`Take pile ${index + 1} (${cards(draft.pack.length)})`}
                  onClick={onTake}
                  disabled={disabled}
                >
                  <ul className="winston-pile__cards">
                    {draft.pack.map((card, cardIndex) => <li key={`${card.name}-${cardIndex}`}><CardImage card={card} /></li>)}
                  </ul>
                </button>
              )}
              {size > 0 && !faceUp && <FaceDown count={size} />}
            </section>
          );
        })}

        <section className="winston-pile winston-pile--stack" aria-label="Stack">
          <h3>Stack · {cards(stackSize)}</h3>
          {stackSize === 0
            ? <p className="winston-pile__empty">Empty</p>
            : <FaceDown count={Math.min(STACK_DEPTH, stackSize)} />}
        </section>
      </div>

      {draft.yourTurn && (
        <div className="winston__actions">
          <button type="button" className="button--secondary" onClick={onPass} disabled={disabled || !canPassPile(draft.winston)}>
            {lastPile ? `Skip pile ${pileNumber}, take the top card of the stack` : `Skip pile ${pileNumber}`}
          </button>
        </div>
      )}
    </section>
  );
}
