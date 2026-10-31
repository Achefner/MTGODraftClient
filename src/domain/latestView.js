/**
 * Updates arrive both from the stream and from action replies, possibly out of order: keep the
 * newest. Equal versions are taken, since presence changes do not add events.
 */
export function latestView(current, incoming) {
  if (!current || current.id !== incoming.id) return incoming;
  return incoming.version >= current.version ? incoming : current;
}
