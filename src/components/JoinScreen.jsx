import { useState } from 'react';
import { findFormat } from '../domain/formats';

/** The page behind an invite link: what the table is, and a name to join it with. */
export default function JoinScreen({ preview, onJoin, onCancel, disabled = false }) {
  const [name, setName] = useState('');
  const back = <button type="button" className="button--secondary" onClick={onCancel}>Start your own draft</button>;
  if (!preview) {
    return (
      <section className="join">
        <p>Loading the table…</p>
        {back}
      </section>
    );
  }

  const host = preview.seats.find((s) => s.seat === 0)?.name ?? 'Someone';
  const format = findFormat([], preview.format).displayName;
  const open = preview.seats.filter((s) => s.kind === 'OPEN').length;
  const canJoin = preview.status === 'LOBBY' && open > 0;

  const handleSubmit = (event) => {
    event.preventDefault();
    onJoin(name.trim());
  };

  return (
    <section className="join">
      <h2>Join {host}'s {format} draft</h2>
      <p>
        {preview.seats.length - open} of {preview.seats.length} seats taken, {open} open seat{open === 1 ? '' : 's'}.
        {' '}Pick timer {preview.timed ? 'on' : 'off'}.
      </p>
      {preview.status !== 'LOBBY' && <p>This draft has already started.</p>}
      {preview.status === 'LOBBY' && open === 0 && <p>The table is full.</p>}
      {canJoin && (
        <form className="join__form" onSubmit={handleSubmit}>
          <label htmlFor="join-name">Your name</label>
          <input id="join-name" type="text" maxLength={40} value={name} onChange={(event) => setName(event.target.value)} disabled={disabled} />
          <button type="submit" disabled={disabled}>Join</button>
        </form>
      )}
      {back}
    </section>
  );
}
