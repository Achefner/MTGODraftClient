import { startDraft, getDraft, pickCard, fetchSources, saveDeck, ApiError } from './draftApi';

const BASE = 'http://api.test';
const jsonResponse = (body, status = 200) => ({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) });
const draft = { id: 'd1', round: 1, pickNumber: 1, pack: [], picks: [] };

beforeEach(() => { global.fetch = jest.fn(); });
afterEach(() => { delete global.fetch; });

describe('startDraft', () => {
  it('POSTs a random draft', async () => {
    global.fetch.mockResolvedValue(jsonResponse(draft, 201));
    await expect(startDraft({ source: 'random' }, BASE)).resolves.toEqual(draft);
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/drafts`, expect.objectContaining({
      method: 'POST', body: JSON.stringify({ source: 'random' }),
    }));
  });

  it('POSTs a cube draft with the collection id', async () => {
    global.fetch.mockResolvedValue(jsonResponse(draft, 201));
    await startDraft({ source: 'cube', collectionId: 'c1' }, BASE);
    expect(global.fetch.mock.calls[0][1].body).toBe(JSON.stringify({ source: 'cube', collectionId: 'c1' }));
  });

  it('throws an ApiError carrying the server message', async () => {
    global.fetch.mockResolvedValue(jsonResponse({ error: 'A draft needs 360 cards but the cube has 40' }, 400));
    const error = await startDraft({ source: 'cube', collectionId: 'c1' }, BASE).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(400);
    expect(error.message).toBe('A draft needs 360 cards but the cube has 40');
  });

  it('falls back to a status message when the body is not JSON', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 502, json: () => Promise.reject(new Error('no json')) });
    await expect(startDraft({ source: 'random' }, BASE)).rejects.toThrow(/502/);
  });
});

describe('getDraft / pickCard / fetchSources / saveDeck', () => {
  it('GETs a draft', async () => {
    global.fetch.mockResolvedValue(jsonResponse(draft));
    await expect(getDraft('d1', BASE)).resolves.toEqual(draft);
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/drafts/d1`, expect.objectContaining({ headers: expect.objectContaining({ Accept: 'application/json' }) }));
  });

  it('POSTs a pick', async () => {
    global.fetch.mockResolvedValue(jsonResponse(draft));
    await pickCard('d1', 'Black Lotus', BASE);
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/drafts/d1/picks`, expect.objectContaining({ method: 'POST', body: JSON.stringify({ cardName: 'Black Lotus' }) }));
  });

  it('GETs the sources', async () => {
    global.fetch.mockResolvedValue(jsonResponse([{ id: 'c1', name: 'Cube', cardCount: 540 }]));
    await expect(fetchSources(BASE)).resolves.toHaveLength(1);
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/drafts/sources`, expect.anything());
  });

  it('POSTs the deck name to save', async () => {
    global.fetch.mockResolvedValue(jsonResponse({ collectionId: 'k1', name: 'My deck', cardCount: 45 }, 201));
    await expect(saveDeck('d1', 'My deck', BASE)).resolves.toEqual({ collectionId: 'k1', name: 'My deck', cardCount: 45 });
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/drafts/d1/deck`, expect.objectContaining({ method: 'POST', body: JSON.stringify({ name: 'My deck' }) }));
  });
});
