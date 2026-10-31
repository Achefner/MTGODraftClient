import CardImage from './CardImage';
import { canPassPile } from '../domain/winston';

const cards = (n) => `${n} card${n === 1 ? '' : 's'}`;

/** The Winston table: three face-down piles, the one the player looks at, and take or pass. */
export default function WinstonTable({ draft, onTake, onPass, disabled = false }) {
  const { pileSizes, currentPile } = draft.winston;
  const pileNumber = currentPile + 1;
  const lastPile = !pileSizes.slice(currentPile + 1).some((size) => size > 0);

  return (
    <section className="winston">
      <ul className="winston__piles" aria-label="Piles">
        {pileSizes.map((size, index) => (
          <li key={index} className="winston__pile" aria-current={draft.yourTurn && index === currentPile ? 'true' : undefined}>
            <img src="/card-back.svg" alt="" className="winston__back" />
            <span>Pile {index + 1}</span>
            <span>{cards(size)}</span>
          </li>
        ))}
      </ul>

      {draft.yourTurn && (
        <>
          <ul className="pack" aria-label={`Pile ${pileNumber} cards`}>
            {draft.pack.map((card, index) => <li key={`${card.name}-${index}`}><CardImage card={card} /></li>)}
          </ul>
          <div className="winston__actions">
            <button type="button" aria-label={`Take pile ${pileNumber}`} onClick={onTake} disabled={disabled}>
              Take pile {pileNumber} ({cards(draft.pack.length)})
            </button>
            <button type="button" aria-label={`Pass pile ${pileNumber}`} onClick={onPass} disabled={disabled || !canPassPile(draft.winston)}>
              {lastPile ? 'Pass and take the top card of the stack' : `Pass to pile ${pileNumber + 1}`}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
