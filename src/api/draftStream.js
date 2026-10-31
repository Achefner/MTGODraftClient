/**
 * Follows a seat's live updates. The browser's EventSource reconnects by itself after a drop and
 * sends the last event id back, so the service resends what was missed. Statuses: 'connected',
 * 'reconnecting' (the browser is retrying), 'closed' (it gave up, e.g. the seat token was refused).
 * Returns a function that closes the stream.
 */
export function openStream(url, { onUpdate, onStatus }, EventSourceImpl = globalThis.EventSource) {
  const source = new EventSourceImpl(url);
  source.addEventListener('open', () => onStatus('connected'));
  source.addEventListener('update', (event) => {
    let update;
    try {
      update = JSON.parse(event.data);
    } catch {
      return;
    }
    onUpdate(update);
  });
  source.addEventListener('error', () => onStatus(source.readyState === EventSourceImpl.CLOSED ? 'closed' : 'reconnecting'));
  return () => source.close();
}
