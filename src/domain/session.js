const KEY = 'mtgo-draft-session';

function defaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/** The seat this browser holds: `{ draftId, token, seat }`, or null. Reloading the page resumes it. */
export function loadSession(storage = defaultStorage()) {
  try {
    const session = JSON.parse(storage?.getItem(KEY) ?? 'null');
    return session && session.draftId && session.token ? session : null;
  } catch {
    return null;
  }
}

export function saveSession(session, storage = defaultStorage()) {
  try {
    storage?.setItem(KEY, JSON.stringify(session));
  } catch {
    // private browsing: the seat lasts as long as the page
  }
}

export function clearSession(storage = defaultStorage()) {
  try {
    storage?.removeItem(KEY);
  } catch {
    // nothing stored
  }
}

/** The table to join from a link like `/?join=<draftId>`. */
export function joinIdFromUrl(search) {
  return new URLSearchParams(search).get('join');
}

export function joinLink(origin, draftId) {
  return `${origin}/?join=${encodeURIComponent(draftId)}`;
}

const layoutKey = (draftId) => `mtgo-draft-layout:${draftId}`;

/** How the player arranged their picks in a draft: `{ columnKey: [pickIndex…] }`, or `{}`. */
export function loadPickLayout(draftId, storage = defaultStorage()) {
  try {
    const layout = JSON.parse(storage?.getItem(layoutKey(draftId)) ?? 'null');
    return layout && typeof layout === 'object' && !Array.isArray(layout) ? layout : {};
  } catch {
    return {};
  }
}

export function savePickLayout(draftId, layout, storage = defaultStorage()) {
  try {
    storage?.setItem(layoutKey(draftId), JSON.stringify(layout));
  } catch {
    // the layout lasts as long as the page
  }
}

export function clearPickLayout(draftId, storage = defaultStorage()) {
  try {
    storage?.removeItem(layoutKey(draftId));
  } catch {
    // nothing stored
  }
}
