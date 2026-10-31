import { API_BASE_URL } from '../config';

export const TOKEN_HEADER = 'X-Seat-Token';

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(url, { token, body, method = 'GET' } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers[TOKEN_HEADER] = token;
  const response = await fetch(url, { method, headers, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const payload = await response.json();
      if (payload && payload.error) message = payload.error;
    } catch {
      // keep the status message
    }
    throw new ApiError(response.status, message);
  }
  return response.json();
}

const draftUrl = (baseUrl, draftId) => `${baseUrl}/drafts/${encodeURIComponent(draftId)}`;

/**
 * Opens a table: `{ source: 'random' | 'cube', collectionId?, format, playerName, timed, startNow }`.
 * Resolves to the seat ticket `{ draftId, seat, token, view }`.
 */
export function openTable(table, baseUrl = API_BASE_URL) {
  return request(`${baseUrl}/drafts`, { method: 'POST', body: table });
}

/** Public facts about a table, for the join page. */
export function previewTable(draftId, baseUrl = API_BASE_URL) {
  return request(`${draftUrl(baseUrl, draftId)}/table`);
}

export function joinTable(draftId, playerName, baseUrl = API_BASE_URL) {
  return request(`${draftUrl(baseUrl, draftId)}/seats`, { method: 'POST', body: { playerName } });
}

export function startTable(draftId, token, baseUrl = API_BASE_URL) {
  return request(`${draftUrl(baseUrl, draftId)}/start`, { method: 'POST', token });
}

export function getDraft(draftId, token, baseUrl = API_BASE_URL) {
  return request(draftUrl(baseUrl, draftId), { token });
}

/** `{ type: 'PICK', cardName, expectedMoves }`, `{ type: 'TAKE_PILE', expectedMoves }` or `{ type: 'PASS_PILE', expectedMoves }`. */
export function act(draftId, token, action, baseUrl = API_BASE_URL) {
  return request(`${draftUrl(baseUrl, draftId)}/actions`, { method: 'POST', token, body: action });
}

/** Saves the seat's picks as a deck collection in the card database. */
export function saveDeck(draftId, token, name, baseUrl = API_BASE_URL) {
  return request(`${draftUrl(baseUrl, draftId)}/deck`, { method: 'POST', token, body: { name } });
}

/** The draft formats: name, displayName, seats, cardsNeeded, description. */
export function fetchFormats(baseUrl = API_BASE_URL) {
  return request(`${baseUrl}/drafts/formats`);
}

/** Cube collections a draft can be started from. */
export function fetchSources(baseUrl = API_BASE_URL) {
  return request(`${baseUrl}/drafts/sources`);
}

/** EventSource cannot send headers, so the stream takes the token as a query parameter. */
export function streamUrl(draftId, token, baseUrl = API_BASE_URL) {
  return `${draftUrl(baseUrl, draftId)}/stream?token=${encodeURIComponent(token)}`;
}
