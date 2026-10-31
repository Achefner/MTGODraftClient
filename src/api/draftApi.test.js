import {
  act, ApiError, fetchFormats, fetchSources, getDraft, joinTable, openTable, previewTable, saveDeck, startTable, streamUrl, TOKEN_HEADER,
} from './draftApi';

const BASE = 'http://api.test';
const jsonResponse = (body, status = 200) => ({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) });
const ticket = { draftId: 'd1', seat: 0, token: 't1', view: { id: 'd1' } };

beforeEach(() => { global.fetch = jest.fn(); });
afterEach(() => { delete global.fetch; });

const lastCall = () => global.fetch.mock.calls[global.fetch.mock.calls.length - 1];

describe('draftApi', () => {
  it('opens a table', async () => {
    global.fetch.mockResolvedValue(jsonResponse(ticket, 201));
    const request = { source: 'random', format: 'WINSTON', playerName: 'Amir', timed: true, startNow: false };
    await expect(openTable(request, BASE)).resolves.toEqual(ticket);
    expect(lastCall()[0]).toBe(`${BASE}/drafts`);
    expect(lastCall()[1]).toMatchObject({ method: 'POST', body: JSON.stringify(request) });
  });

  it('previews and joins a table', async () => {
    global.fetch.mockResolvedValue(jsonResponse({ id: 'd1' }));
    await previewTable('d1', BASE);
    expect(lastCall()[0]).toBe(`${BASE}/drafts/d1/table`);

    global.fetch.mockResolvedValue(jsonResponse(ticket, 201));
    await joinTable('d1', 'Guest', BASE);
    expect(lastCall()[0]).toBe(`${BASE}/drafts/d1/seats`);
    expect(lastCall()[1]).toMatchObject({ method: 'POST', body: JSON.stringify({ playerName: 'Guest' }) });
  });

  it('sends the seat token with every seat call', async () => {
    global.fetch.mockResolvedValue(jsonResponse({ id: 'd1' }));

    await getDraft('d1', 't1', BASE);
    expect(lastCall()[0]).toBe(`${BASE}/drafts/d1`);
    expect(lastCall()[1].headers[TOKEN_HEADER]).toBe('t1');

    await startTable('d1', 't1', BASE);
    expect(lastCall()[0]).toBe(`${BASE}/drafts/d1/start`);
    expect(lastCall()[1]).toMatchObject({ method: 'POST' });
    expect(lastCall()[1].headers[TOKEN_HEADER]).toBe('t1');

    await act('d1', 't1', { type: 'PICK', cardName: 'Bolt', expectedMoves: 3 }, BASE);
    expect(lastCall()[0]).toBe(`${BASE}/drafts/d1/actions`);
    expect(lastCall()[1].body).toBe(JSON.stringify({ type: 'PICK', cardName: 'Bolt', expectedMoves: 3 }));
    expect(lastCall()[1].headers[TOKEN_HEADER]).toBe('t1');

    await saveDeck('d1', 't1', 'My deck', BASE);
    expect(lastCall()[0]).toBe(`${BASE}/drafts/d1/deck`);
    expect(lastCall()[1].body).toBe(JSON.stringify({ name: 'My deck' }));
    expect(lastCall()[1].headers[TOKEN_HEADER]).toBe('t1');
  });

  it('GETs the formats and the cube sources', async () => {
    global.fetch.mockResolvedValue(jsonResponse([]));
    await fetchFormats(BASE);
    expect(lastCall()[0]).toBe(`${BASE}/drafts/formats`);
    await fetchSources(BASE);
    expect(lastCall()[0]).toBe(`${BASE}/drafts/sources`);
  });

  it('builds the stream URL with the token', () => {
    expect(streamUrl('d 1', 't+1', BASE)).toBe(`${BASE}/drafts/d%201/stream?token=t%2B1`);
  });

  it('throws an ApiError carrying the server message, or the status', async () => {
    global.fetch.mockResolvedValue(jsonResponse({ error: 'Your view is out of date' }, 409));
    const error = await getDraft('d1', 't1', BASE).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(409);
    expect(error.message).toBe('Your view is out of date');

    global.fetch.mockResolvedValue({ ok: false, status: 502, json: () => Promise.reject(new Error('no json')) });
    await expect(fetchSources(BASE)).rejects.toThrow(/502/);
  });
});
