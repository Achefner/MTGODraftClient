import { act as rtlAct, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import {
  act, ApiError, fetchFormats, fetchSources, getDraft, joinTable, openTable, previewTable, saveDeck, startTable,
} from './api/draftApi';
import { openStream } from './api/draftStream';
import { DEFAULT_FORMATS } from './domain/formats';
import { loadPickLayout, loadSession, saveSession, savePickLayout } from './domain/session';

jest.mock('./api/draftApi', () => {
  const actual = jest.requireActual('./api/draftApi');
  const mocked = ['act', 'fetchFormats', 'fetchSources', 'getDraft', 'joinTable', 'openTable', 'previewTable', 'saveDeck', 'startTable'];
  return { ...actual, ...Object.fromEntries(mocked.map((name) => [name, jest.fn()])) };
});
jest.mock('./api/draftStream', () => ({ openStream: jest.fn() }));

const card = (i) => ({ name: `Card ${i}`, imageUrl: `https://img/${i}.jpg`, manaValue: i % 8 });
const pack = (n, from = 0) => Array.from({ length: n }, (_, i) => card(from + i));
const seat = (n, overrides = {}) => ({ seat: n, you: n === 0, name: n === 0 ? 'Amir' : null, kind: n === 0 ? 'HUMAN' : 'BOT', connected: n === 0, pickCount: 0, ...overrides });
const view = (overrides) => ({
  id: 'd1', source: 'random', format: 'CLASSIC', status: 'RUNNING', version: 2, seat: 0, host: true, yourTurn: true, finished: false,
  moves: 0, timer: null, round: 1, pickNumber: 1, direction: 'LEFT', packNumber: null, opener: null, activeSeat: null,
  pack: pack(15), picks: [], winston: null, seats: Array.from({ length: 8 }, (_, i) => seat(i)), log: [], ...overrides,
});
const ticket = (v = view(), overrides = {}) => ({ draftId: v.id, seat: v.seat, token: 'tok', view: v, ...overrides });

let stream;
const push = (v) => rtlAct(() => stream.onUpdate({ version: v.version, events: [], view: v }));

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  window.history.replaceState({}, '', '/');
  fetchSources.mockResolvedValue([{ id: 'c1', name: 'Power LSV Cube', cardCount: 540 }]);
  fetchFormats.mockResolvedValue(DEFAULT_FORMATS);
  stream = null;
  openStream.mockImplementation((url, handlers) => {
    stream = { url, ...handlers, closed: false };
    return () => { stream.closed = true; };
  });
});

const soloStart = async (format) => {
  render(<App />);
  await screen.findByRole('option', { name: /power lsv cube/i });
  if (format) await userEvent.selectOptions(await screen.findByRole('combobox', { name: /format/i }), format);
  await userEvent.click(await screen.findByRole('button', { name: /draft against bots/i }));
};

describe('App', () => {
  it('drafts against bots: opens the table, keeps the seat and follows the stream', async () => {
    openTable.mockResolvedValue(ticket());
    await soloStart();

    expect(openTable).toHaveBeenCalledWith({ source: 'cube', collectionId: 'c1', format: 'CLASSIC', playerName: '', timed: true, startNow: true });
    expect(await screen.findByText('Pack 1 of 3')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^pick /i })).toHaveLength(15);
    expect(loadSession()).toEqual({ draftId: 'd1', token: 'tok', seat: 0 });
    expect(stream.url).toContain('/drafts/d1/stream?token=tok');
  });

  it('shows what the stream sends, and ignores an older view arriving late', async () => {
    openTable.mockResolvedValue(ticket());
    await soloStart();
    await screen.findByText('Pack 1 of 3');

    await push(view({ version: 9, pickNumber: 3, pack: pack(13, 50) }));
    expect(screen.getByText('Pick 3 of 15')).toBeInTheDocument();

    await push(view({ version: 4, pickNumber: 2 }));
    expect(screen.getByText('Pick 3 of 15')).toBeInTheDocument();
  });

  it('picks with the move count it saw', async () => {
    openTable.mockResolvedValue(ticket());
    act.mockResolvedValue(view({ version: 12, moves: 1, pickNumber: 2, pack: pack(14, 100), picks: [card(3)] }));
    await soloStart();

    await userEvent.click(await screen.findByRole('button', { name: 'Pick Card 3' }));

    expect(act).toHaveBeenCalledWith('d1', 'tok', { type: 'PICK', cardName: 'Card 3', expectedMoves: 0 });
    expect(await screen.findByText('Pick 2 of 15')).toBeInTheDocument();
    const picks = screen.getByRole('region', { name: /your picks \(1\/45\)/i });
    expect(within(picks).getByRole('img', { name: 'Card 3' })).toBeInTheDocument();
  });

  it('reloads the draft when an action was out of date', async () => {
    openTable.mockResolvedValue(ticket());
    act.mockRejectedValue(new ApiError(409, 'Your view is out of date'));
    getDraft.mockResolvedValue(view({ version: 20, moves: 1, pickNumber: 2, pack: pack(14, 100) }));
    await soloStart();

    await userEvent.click(await screen.findByRole('button', { name: 'Pick Card 3' }));

    expect(getDraft).toHaveBeenCalledWith('d1', 'tok');
    expect(await screen.findByText('Pick 2 of 15')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/out of date/i);
  });

  it('shows other errors and keeps the pack', async () => {
    openTable.mockResolvedValue(ticket());
    act.mockRejectedValue(new ApiError(400, 'Card is not in your pack: Card 3'));
    await soloStart();

    await userEvent.click(await screen.findByRole('button', { name: 'Pick Card 3' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/not in your pack/i);
    expect(screen.getAllByRole('button', { name: /^pick /i })).toHaveLength(15);
    expect(getDraft).not.toHaveBeenCalled();
  });

  it('comes back to the same seat after a reload', async () => {
    saveSession({ draftId: 'd1', token: 'tok', seat: 0 });
    getDraft.mockResolvedValue(view({ version: 30, pickNumber: 6, pack: pack(10) }));

    render(<App />);

    expect(await screen.findByText('Pick 6 of 15')).toBeInTheDocument();
    expect(getDraft).toHaveBeenCalledWith('d1', 'tok');
    expect(stream.url).toContain('token=tok');
    expect(screen.queryByRole('button', { name: /draft against bots/i })).not.toBeInTheDocument();
  });

  it('forgets a seat the service no longer knows', async () => {
    saveSession({ draftId: 'gone', token: 'tok', seat: 0 });
    getDraft.mockRejectedValue(new ApiError(404, 'Draft not found: gone'));

    render(<App />);

    expect(await screen.findByRole('button', { name: /draft against bots/i })).toBeInTheDocument();
    expect(loadSession()).toBeNull();
  });

  it('says when the connection drops and when it is back', async () => {
    openTable.mockResolvedValue(ticket());
    await soloStart();
    await screen.findByText('Pack 1 of 3');

    rtlAct(() => stream.onStatus('reconnecting'));
    expect(screen.getByRole('status')).toHaveTextContent(/reconnecting/i);

    rtlAct(() => stream.onStatus('connected'));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows the pick clock', async () => {
    openTable.mockResolvedValue(ticket(view({ timer: { deadline: 'x', seconds: 75, remainingMillis: 75_000 } })));
    await soloStart();
    expect(await screen.findByRole('timer')).toHaveTextContent('1:15');
  });

  it('opens a table, shares the link, and the host starts it', async () => {
    const lobby = view({ status: 'LOBBY', version: 0, pack: [], round: null, pickNumber: null, direction: null,
      seats: [seat(0), seat(1, { kind: 'OPEN' })] });
    openTable.mockResolvedValue(ticket(lobby));
    startTable.mockResolvedValue(view({ version: 2 }));
    render(<App />);

    await userEvent.type(await screen.findByRole('textbox', { name: /your name/i }), 'Amir');
    await userEvent.click(screen.getByRole('button', { name: /open a table/i }));

    expect(openTable).toHaveBeenCalledWith(expect.objectContaining({ playerName: 'Amir', startNow: false }));
    expect(await screen.findByRole('textbox', { name: /invite link/i })).toHaveValue('http://localhost/?join=d1');

    await push({ ...lobby, seats: [seat(0), seat(1, { kind: 'HUMAN', name: 'Guest', connected: true })] });
    expect(within(screen.getByRole('list', { name: /seats/i })).getByText(/guest/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /start the draft/i }));
    expect(startTable).toHaveBeenCalledWith('d1', 'tok');
    expect(await screen.findByText('Pack 1 of 3')).toBeInTheDocument();
  });

  it('joins a table from an invite link', async () => {
    window.history.replaceState({}, '', '/?join=d9');
    previewTable.mockResolvedValue({ id: 'd9', format: 'WINSTON', source: 'random', status: 'LOBBY', timed: false,
      seats: [seat(0, { you: false }), seat(1, { kind: 'OPEN' })] });
    const guestLobby = view({ id: 'd9', status: 'LOBBY', format: 'WINSTON', seat: 1, host: false, version: 0, pack: [],
      seats: [seat(0, { you: false }), seat(1, { you: true, kind: 'HUMAN', name: 'Guest' })] });
    joinTable.mockResolvedValue({ draftId: 'd9', seat: 1, token: 'guest-tok', view: guestLobby });
    render(<App />);

    expect(await screen.findByRole('heading', { name: /join amir's winston draft/i })).toBeInTheDocument();
    await userEvent.type(screen.getByRole('textbox', { name: /your name/i }), 'Guest');
    await userEvent.click(screen.getByRole('button', { name: /^join$/i }));

    expect(joinTable).toHaveBeenCalledWith('d9', 'Guest');
    expect(await screen.findByText(/waiting for amir to start/i)).toBeInTheDocument();
    expect(loadSession()).toEqual({ draftId: 'd9', token: 'guest-tok', seat: 1 });
    expect(window.location.search).toBe('');
    expect(stream.url).toContain('token=guest-tok');
  });

  it('zooms a card picture on hover', async () => {
    openTable.mockResolvedValue(ticket());
    await soloStart();
    const picture = within(await screen.findByRole('button', { name: 'Pick Card 2' })).getByRole('img');

    fireEvent.mouseMove(picture, { clientX: 50, clientY: 300 });

    expect(screen.getByTestId('card-zoom').querySelector('img')).toHaveAttribute('src', 'https://img/2.jpg');
  });

  it('drops the zoom of the card just picked', async () => {
    openTable.mockResolvedValue(ticket());
    act.mockResolvedValue(view({ version: 12, moves: 1, pickNumber: 2, pack: pack(14, 100), picks: [card(2)] }));
    await soloStart();
    const button = await screen.findByRole('button', { name: 'Pick Card 2' });
    fireEvent.mouseMove(within(button).getByRole('img'), { clientX: 50, clientY: 300 });
    expect(screen.getByTestId('card-zoom')).toBeInTheDocument();

    await userEvent.click(button);

    expect(await screen.findByText('Pick 2 of 15')).toBeInTheDocument();
    expect(screen.queryByTestId('card-zoom')).not.toBeInTheDocument();
  });

  it('drags a pick to another column, and finds it there after a reload', async () => {
    const drafting = view({ version: 12, moves: 2, pickNumber: 3, pack: pack(13, 100), picks: [card(2), card(3)] });
    openTable.mockResolvedValue(ticket(drafting));
    await soloStart();
    const column = (label) => screen.getByRole('region', { name: `Mana value ${label}` });

    fireEvent.dragStart(within(await screen.findByRole('region', { name: 'Mana value 2' })).getByRole('img', { name: 'Card 2' }).closest('li'));
    fireEvent.drop(column('5'));
    expect(within(column('5')).getByRole('img', { name: 'Card 2' })).toBeInTheDocument();

    cleanup();
    getDraft.mockResolvedValue(drafting);
    render(<App />);
    expect(within(await screen.findByRole('region', { name: 'Mana value 5' })).getByRole('img', { name: 'Card 2' })).toBeInTheDocument();
  });

  it('forgets the layout when leaving the finished draft', async () => {
    savePickLayout('d1', { 'mv-5': [0] });
    openTable.mockResolvedValue(ticket(view({ version: 100, finished: true, status: 'FINISHED', yourTurn: false, pack: [], picks: [card(2)] })));
    await soloStart();
    expect(within(await screen.findByRole('region', { name: 'Mana value 5' })).getByRole('img', { name: 'Card 2' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /new draft/i }));

    expect(loadPickLayout('d1')).toEqual({});
  });

  it('still offers every format and random cards when the lists cannot be loaded', async () => {
    fetchSources.mockRejectedValue(new Error('boom'));
    fetchFormats.mockRejectedValue(new Error('boom'));
    render(<App />);
    expect(await screen.findByRole('button', { name: /draft against bots/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Winston' })).toBeInTheDocument();
  });

  it('shows the error when the draft cannot start', async () => {
    openTable.mockRejectedValue(new ApiError(502, 'Card database unreachable'));
    await soloStart();
    expect(await screen.findByRole('alert')).toHaveTextContent(/card database unreachable/i);
    expect(screen.getByRole('button', { name: /draft against bots/i })).toBeInTheDocument();
  });

  it('Rochester: picks from the table and shows what the others took', async () => {
    const rochester = (o) => view({ format: 'ROCHESTER', packNumber: 1, opener: 0, activeSeat: 0, ...o });
    openTable.mockResolvedValue(ticket(rochester()));
    act.mockResolvedValue(rochester({
      version: 20, moves: 1, packNumber: 2, opener: 1, pickNumber: 8, pack: pack(8, 50), picks: [card(0)],
      log: [{ type: 'CARD_PICKED', seat: 7, cards: [{ name: 'Lightning Bolt' }] }],
    }));
    await soloStart('ROCHESTER');

    const table = await screen.findByRole('list', { name: 'Table' });
    await userEvent.click(within(table).getByRole('button', { name: 'Pick Card 0' }));

    expect(await screen.findByText('Booster 2 of 8, opened by Seat 1')).toBeInTheDocument();
    expect(within(screen.getByRole('list', { name: /what happened/i })).getByText('Seat 7 picked Lightning Bolt.')).toBeInTheDocument();
  });

  it('Winston: takes and passes piles', async () => {
    const winston = (o) => view({ format: 'WINSTON', round: null, pickNumber: null, direction: null, activeSeat: 0, pack: [card(1)],
      winston: { pileSizes: [1, 1, 1], currentPile: 0, stackSize: 87 }, seats: [seat(0), seat(1)], ...o });
    openTable.mockResolvedValue(ticket(winston()));
    act.mockResolvedValueOnce(winston({ version: 3, moves: 1, pack: [card(2)], winston: { pileSizes: [2, 1, 1], currentPile: 1, stackSize: 86 } }));
    act.mockResolvedValueOnce(winston({ version: 6, moves: 2, picks: [card(2)], winston: { pileSizes: [2, 1, 1], currentPile: 0, stackSize: 84 } }));
    await soloStart('WINSTON');

    await userEvent.click(await screen.findByRole('button', { name: 'Pass pile 1' }));
    expect(act).toHaveBeenCalledWith('d1', 'tok', { type: 'PASS_PILE', expectedMoves: 0 });
    await userEvent.click(await screen.findByRole('button', { name: 'Take pile 2' }));
    expect(act).toHaveBeenCalledWith('d1', 'tok', { type: 'TAKE_PILE', expectedMoves: 1 });
    expect(await screen.findByText('84 cards in the stack')).toBeInTheDocument();
  });

  it('shows the seats with names when friends play', async () => {
    openTable.mockResolvedValue(ticket(view({ seats: [seat(0), seat(1, { kind: 'HUMAN', name: 'Guest', connected: false })] })));
    await soloStart();
    const table = await screen.findByRole('list', { name: /^table$/i });
    expect(within(table).getByText('Guest')).toBeInTheDocument();
  });

  it('finishes: saves the deck with the seat token, then a new draft forgets the seat', async () => {
    openTable.mockResolvedValue(ticket(view({ version: 100, finished: true, status: 'FINISHED', yourTurn: false, pack: [], picks: pack(45, 200) })));
    saveDeck.mockResolvedValue({ collectionId: 'k1', name: 'Night deck', cardCount: 45 });
    await soloStart();

    expect(await screen.findByRole('heading', { name: /draft complete/i })).toBeInTheDocument();
    await userEvent.type(screen.getByRole('textbox', { name: /deck name/i }), 'Night deck');
    await userEvent.click(screen.getByRole('button', { name: /save deck/i }));
    expect(saveDeck).toHaveBeenCalledWith('d1', 'tok', 'Night deck');
    expect(await screen.findByText(/saved as "Night deck" \(45 cards\)/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /new draft/i }));
    expect(await screen.findByRole('button', { name: /draft against bots/i })).toBeInTheDocument();
    expect(loadSession()).toBeNull();
    expect(stream.closed).toBe(true);
  });

  it('keeps the seat when the service is only unreachable on reload', async () => {
    saveSession({ draftId: 'd1', token: 'tok', seat: 0 });
    getDraft.mockRejectedValue(new ApiError(502, 'Card database unreachable'));
    render(<App />);
    expect(await screen.findByRole('alert')).toHaveTextContent(/unreachable/i);
    expect(loadSession()).not.toBeNull();
    expect(screen.getByText(/loading your draft/i)).toBeInTheDocument();
  });

  it('says when an invite link points to no table, and goes back to the start', async () => {
    window.history.replaceState({}, '', '/?join=nope');
    previewTable.mockRejectedValue(new ApiError(404, 'Draft not found: nope'));
    render(<App />);
    expect(await screen.findByRole('alert')).toHaveTextContent(/not found/i);

    await userEvent.click(screen.getByRole('button', { name: /start your own draft/i }));
    expect(await screen.findByRole('button', { name: /draft against bots/i })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(window.location.search).toBe('');
  });
});
