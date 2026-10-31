import { seatName } from '../domain/formats';

const picks = (n) => `${n} pick${n === 1 ? '' : 's'}`;

/** Who sits where once the draft runs; only worth showing when other people play. */
export default function SeatList({ draft }) {
  const humans = draft.seats.filter((s) => s.kind === 'HUMAN').length;
  if (humans < 2) return null;
  return (
    <section className="seat-list">
      <h2 id="seat-list-heading">Table</h2>
      <ul aria-labelledby="seat-list-heading">
        {draft.seats.map((seat) => (
          <li key={seat.seat} className={seat.kind === 'HUMAN' && !seat.connected && !seat.you ? 'seat-list__seat--offline' : undefined}>
            <span>{seatName(seat.seat, draft)}</span>
            <span className="seat-list__detail">
              {seat.kind === 'BOT' ? 'bot · ' : ''}{seat.kind === 'HUMAN' && !seat.connected && !seat.you ? 'offline · ' : ''}{picks(seat.pickCount)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
