import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { startDraft, act, fetchSources, fetchFormats, saveDeck, ApiError } from './api/draftApi';
import { DEFAULT_FORMATS } from './domain/formats';

jest.mock('./api/draftApi', () => {
  const actual = jest.requireActual('./api/draftApi');
  return { ...actual, startDraft: jest.fn(), act: jest.fn(), fetchSources: jest.fn(), fetchFormats: jest.fn(), saveDeck: jest.fn() };
});

const card = (i) => ({ name: `Card ${i}`, imageUrl: `https://img/${i}.jpg` });
const pack = (n, from = 0) => Array.from({ length: n }, (_, i) => card(from + i));
const draft = (overrides) => ({
  id: 'd1', source: 'random', format: 'CLASSIC', seat: 0, yourTurn: true, finished: false,
  round: 1, pickNumber: 1, direction: 'LEFT', packNumber: null, opener: null, activeSeat: null,
  pack: pack(15), picks: [], winston: null, seats: [], log: [], ...overrides,
});
const rochester = (overrides) => draft({ format: 'ROCHESTER', packNumber: 1, opener: 0, activeSeat: 0, ...overrides });
const winston = (overrides) => draft({
  format: 'WINSTON', round: null, pickNumber: null, direction: null, activeSeat: 0, pack: [card(1)],
  winston: { pileSizes: [1, 1, 1], currentPile: 0, stackSize: 87 }, ...overrides,
});

beforeEach(() => {
  [startDraft, act, fetchSources, fetchFormats, saveDeck].forEach((fn) => fn.mockReset());
  fetchSources.mockResolvedValue([{ id: 'c1', name: 'Power LSV Cube', cardCount: 540 }]);
  fetchFormats.mockResolvedValue(DEFAULT_FORMATS);
});

const begin = async (format) => {
  render(<App />);
  if (format) await userEvent.selectOptions(await screen.findByRole('combobox', { name: /format/i }), format);
  await userEvent.click(await screen.findByRole('button', { name: /start draft/i }));
};

describe('App', () => {
  it('shows the start screen, then the first pack after starting a Classic draft', async () => {
    startDraft.mockResolvedValue(draft());
    await begin();

    expect(startDraft).toHaveBeenCalledWith({ source: 'random', format: 'CLASSIC' });
    expect(await screen.findByText('Pack 1 of 3')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^pick /i })).toHaveLength(15);
    expect(screen.getByRole('heading', { name: /your picks \(0\/45\)/i })).toBeInTheDocument();
  });

  it('starts a cube draft when a cube is selected', async () => {
    startDraft.mockResolvedValue(draft({ source: 'cube:c1' }));
    render(<App />);
    await screen.findByRole('option', { name: /power lsv cube/i });
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /card pool/i }), 'c1');
    await userEvent.click(screen.getByRole('button', { name: /start draft/i }));
    expect(startDraft).toHaveBeenCalledWith({ source: 'cube', collectionId: 'c1', format: 'CLASSIC' });
  });

  it('still offers every format and random cards when the lists cannot be loaded', async () => {
    fetchSources.mockRejectedValue(new Error('boom'));
    fetchFormats.mockRejectedValue(new Error('boom'));
    render(<App />);
    expect(await screen.findByRole('button', { name: /start draft/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Winston' })).toBeInTheDocument();
  });

  it('shows the error when the draft cannot start', async () => {
    startDraft.mockRejectedValue(new ApiError(502, 'Card database unreachable'));
    await begin();
    expect(await screen.findByRole('alert')).toHaveTextContent(/card database unreachable/i);
    expect(screen.getByRole('button', { name: /start draft/i })).toBeInTheDocument();
  });

  it('picks a card and shows the next pack and the pick', async () => {
    startDraft.mockResolvedValue(draft());
    act.mockResolvedValue(draft({ pickNumber: 2, pack: pack(14, 100), picks: [card(3)] }));
    await begin();
    await screen.findByText('Pack 1 of 3');

    await userEvent.click(screen.getByRole('button', { name: 'Pick Card 3' }));

    expect(act).toHaveBeenCalledWith('d1', { type: 'PICK', cardName: 'Card 3' });
    expect(await screen.findByText('Pick 2 of 15')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^pick /i })).toHaveLength(14);
    const picks = screen.getByRole('list', { name: /your picks/i });
    expect(within(picks).getByRole('img', { name: 'Card 3' })).toBeInTheDocument();
  });

  it('shows a pick error and keeps the pack', async () => {
    startDraft.mockResolvedValue(draft());
    act.mockRejectedValue(new ApiError(400, 'Card is not in your pack: Card 3'));
    await begin();
    await screen.findByText('Pack 1 of 3');

    await userEvent.click(screen.getByRole('button', { name: 'Pick Card 3' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/not in your pack/i);
    expect(screen.getAllByRole('button', { name: /^pick /i })).toHaveLength(15);
  });

  it('Rochester: picks from the table and shows what the other seats took', async () => {
    startDraft.mockResolvedValue(rochester());
    act.mockResolvedValue(rochester({
      packNumber: 2, opener: 1, pickNumber: 8, pack: pack(8, 50), picks: [card(0)],
      log: [{ type: 'CARD_PICKED', seat: 0, cards: [card(0)] }, { type: 'CARD_PICKED', seat: 7, cards: [{ name: 'Lightning Bolt' }] }],
    }));
    await begin('ROCHESTER');

    expect(startDraft).toHaveBeenCalledWith({ source: 'random', format: 'ROCHESTER' });
    const table = await screen.findByRole('list', { name: 'Table' });
    await userEvent.click(within(table).getByRole('button', { name: 'Pick Card 0' }));

    expect(await screen.findByText('Booster 2 of 8, opened by Seat 1')).toBeInTheDocument();
    const log = screen.getByRole('list', { name: /what happened/i });
    expect(within(log).getByText('Seat 7 picked Lightning Bolt.')).toBeInTheDocument();
  });

  it('Winston: takes and passes piles', async () => {
    startDraft.mockResolvedValue(winston());
    act.mockResolvedValueOnce(winston({ pack: [card(2)], winston: { pileSizes: [2, 1, 1], currentPile: 1, stackSize: 86 } }));
    act.mockResolvedValueOnce(winston({
      pack: [card(4)], picks: [card(2)], winston: { pileSizes: [2, 1, 1], currentPile: 0, stackSize: 84 },
      log: [{ type: 'PILE_TAKEN', seat: 1, pile: 1, cardCount: 2, cards: [] }],
    }));
    await begin('WINSTON');

    await userEvent.click(await screen.findByRole('button', { name: 'Pass pile 1' }));
    expect(act).toHaveBeenCalledWith('d1', { type: 'PASS_PILE' });
    await userEvent.click(await screen.findByRole('button', { name: 'Take pile 2' }));
    expect(act).toHaveBeenCalledWith('d1', { type: 'TAKE_PILE' });

    expect(await screen.findByText('Opponent took pile 1 (2 cards).')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Your picks (1)' })).toBeInTheDocument();
    expect(screen.getByText('84 cards in the stack')).toBeInTheDocument();
  });

  it('shows the summary when the draft is finished, saves the deck and restarts', async () => {
    startDraft.mockResolvedValueOnce(draft({ round: 3, pickNumber: 15, pack: [card(1)], picks: pack(44, 200) }));
    act.mockResolvedValue(draft({ round: 3, pickNumber: 15, finished: true, yourTurn: false, pack: [], picks: pack(45, 200) }));
    saveDeck.mockResolvedValue({ collectionId: 'k1', name: 'Night deck', cardCount: 45 });
    startDraft.mockResolvedValueOnce(draft());
    await begin();
    await userEvent.click(await screen.findByRole('button', { name: 'Pick Card 1' }));

    expect(await screen.findByRole('heading', { name: /draft complete/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^pick /i })).not.toBeInTheDocument();

    await userEvent.type(screen.getByRole('textbox', { name: /deck name/i }), 'Night deck');
    await userEvent.click(screen.getByRole('button', { name: /save deck/i }));
    expect(saveDeck).toHaveBeenCalledWith('d1', 'Night deck');
    expect(await screen.findByText(/saved as "Night deck" \(45 cards\)/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /new draft/i }));
    expect(await screen.findByRole('button', { name: /start draft/i })).toBeInTheDocument();
  });
});
