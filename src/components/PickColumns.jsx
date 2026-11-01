import CardImage from './CardImage';
import { pickColumns } from '../domain/pickColumns';

/**
 * Picks laid out in mana value columns, each column a stack of overlapping cards showing their
 * title bar; hovering one zooms it. {@code total} is left out when the format has none.
 */
export default function PickColumns({ picks, total, title = 'Your picks' }) {
  const heading = `${title} (${total === undefined ? picks.length : `${picks.length}/${total}`})`;
  return (
    <section className="pick-columns" aria-label={heading}>
      <h2>{heading}</h2>
      {picks.length === 0 ? (
        <p className="pick-columns__empty">No picks yet.</p>
      ) : (
        <div className="pick-columns__row">
          {pickColumns(picks).map((column) => (
            <section key={column.key} className="pick-column" aria-label={`Mana value ${column.label}`}>
              <h3>{column.label} <span className="pick-column__count">({column.cards.length})</span></h3>
              <ul>
                {column.cards.map((card, index) => (
                  <li key={`${card.name}-${index}`} title={card.name}><CardImage card={card} /></li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
