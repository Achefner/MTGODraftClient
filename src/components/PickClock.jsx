import { useEffect, useState } from 'react';

const URGENT_MILLIS = 10_000;

const format = (millis) => {
  const total = Math.ceil(millis / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

/**
 * Counts down the seat's pick clock. It starts from the time left when the view arrived
 * (`receivedAt`), so a browser whose clock differs from the server's still counts right.
 */
export default function PickClock({ timer, receivedAt }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, []);

  const left = Math.max(0, receivedAt + timer.remainingMillis - now);
  return (
    <span role="timer" className={`pick-clock${left <= URGENT_MILLIS ? ' pick-clock--urgent' : ''}`} aria-label="Time left to pick">
      {format(left)}
    </span>
  );
}
