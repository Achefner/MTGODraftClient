import { useState } from 'react';
import { findFormat } from '../domain/formats';

function seatLabel(seat) {
  if (seat.kind === 'OPEN') return 'Open seat';
  return `${seat.name}${seat.you ? ' (you)' : ''}${seat.connected || seat.you ? '' : ' · offline'}`;
}

/** Before the draft: the link to share, who sits where, and the host's start button. */
export default function Lobby({ view, link, onStart, onLeave, disabled = false }) {
  const [copied, setCopied] = useState(false);
  const host = view.seats.find((s) => s.seat === 0)?.name ?? 'the host';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      // the field can still be copied by hand
    }
  };

  return (
    <section className="lobby">
      <h2>{findFormat([], view.format).displayName} table</h2>
      <label htmlFor="invite-link">Invite link</label>
      <div className="lobby__link">
        <input id="invite-link" type="text" readOnly value={link} onFocus={(event) => event.target.select()} />
        <button type="button" className="button--secondary" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
      </div>

      <ul className="lobby__seats" aria-label="Seats">
        {view.seats.map((seat) => (
          <li key={seat.seat} className={`lobby__seat lobby__seat--${seat.kind.toLowerCase()}`}>
            <span className="lobby__seat-number">{seat.seat + 1}</span> {seatLabel(seat)}
          </li>
        ))}
      </ul>
      <p className="lobby__hint">Open seats will be played by bots.</p>

      <div className="lobby__buttons">
        {view.host
          ? <button type="button" onClick={onStart} disabled={disabled}>Start the draft</button>
          : <p>Waiting for {host} to start…</p>}
        <button type="button" className="button--secondary" onClick={onLeave}>Leave</button>
      </div>
    </section>
  );
}
