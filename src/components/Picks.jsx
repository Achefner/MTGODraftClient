import CardImage from './CardImage';

/** The player's picks so far, most recent first. */
export default function Picks({ picks, total }) {
  return (
    <section className="picks">
      <h2 id="picks-heading">Your picks ({picks.length}/{total})</h2>
      {picks.length === 0 ? (
        <p className="picks__empty">No picks yet.</p>
      ) : (
        <ul className="picks__list" aria-labelledby="picks-heading">
          {[...picks].reverse().map((card, index) => (
            <li key={`${card.name}-${index}`} title={card.name}>
              <CardImage card={card} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
