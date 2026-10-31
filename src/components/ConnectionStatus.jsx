const MESSAGES = {
  reconnecting: 'Connection lost, reconnecting… Your seat is kept.',
  closed: 'Disconnected, reload the page to come back to your seat.',
};

/** A banner while the live connection is down. */
export default function ConnectionStatus({ status }) {
  const message = MESSAGES[status];
  if (!message) return null;
  return <p role="status" className={`connection connection--${status}`}>{message}</p>;
}
