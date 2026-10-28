import { API_BASE_URL } from '../config';

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers ?? {}) },
  });
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (body && body.error) message = body.error;
    } catch {
      // keep the status message
    }
    throw new ApiError(response.status, message);
  }
  return response.json();
}

/** Starts a draft: `{ source: 'random' }` or `{ source: 'cube', collectionId }`. */
export function startDraft(source, baseUrl = API_BASE_URL) {
  return request(`${baseUrl}/drafts`, { method: 'POST', body: JSON.stringify(source) });
}

export function getDraft(draftId, baseUrl = API_BASE_URL) {
  return request(`${baseUrl}/drafts/${encodeURIComponent(draftId)}`);
}

export function pickCard(draftId, cardName, baseUrl = API_BASE_URL) {
  return request(`${baseUrl}/drafts/${encodeURIComponent(draftId)}/picks`, { method: 'POST', body: JSON.stringify({ cardName }) });
}

/** Cube collections a draft can be started from. */
export function fetchSources(baseUrl = API_BASE_URL) {
  return request(`${baseUrl}/drafts/sources`);
}

/** Saves the picks so far as a deck collection in the card database. */
export function saveDeck(draftId, name, baseUrl = API_BASE_URL) {
  return request(`${baseUrl}/drafts/${encodeURIComponent(draftId)}/deck`, { method: 'POST', body: JSON.stringify({ name }) });
}
