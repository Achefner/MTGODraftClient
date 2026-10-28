import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { startDraft, pickCard, fetchSources, saveDeck, ApiError } from './api/draftApi';

jest.mock('./api/draftApi', () => {
  const actual = jest.requireActual('./api/draftApi');
  return { ...actual, startDraft: jest.fn(), pickCard: jest.fn(), fetchSources: jest.fn(), saveDeck: jest.fn() };
});

const card = (i) => ({ name: `Card ${i}`, imageUrl: `https://img/${i}.jpg` });
const pack = (n, from = 0) => Array.from({ length: n }, (_, i) => card(from + i));
const draft = (overrides) => ({
  id: 'd1', source: 'random', round: 1, pickNumber: 1, direction: 'LEFT', finished: false, pack: pack(15), picks: [], ...overrides,
});

beforeEach(() => {
  startDraft.mockReset();
  pickCard.mockReset();
  fetchSources.mockReset();
  saveDeck.mockReset();
  fetchSources.mockResolvedValue([{ id: 'c1', name: 'Power LSV Cube', cardCount: 540 }]);
});

const begin = async () => {
  render(<App />);
  await userEvent.click(await screen.findByRole('button', { name: /start draft/i }));
};

describe('App', () => {
  it('shows the start screen with the cubes, then the first pack after starting', async () => {
    startDraft.mockResolvedValue(draft());
    await begin();

    expect(startDraft).toHaveBeenCalledWith({ source: 'random' });
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
    expect(startDraft).toHaveBeenCalledWith({ source: 'cube', collectionId: 'c1' });
  });

  it('still shows the start screen when the cube list cannot be loaded', async () => {
    fetchSources.mockRejectedValue(new Error('boom'));
    render(<App />);
    expect(await screen.findByRole('button', { name: /start draft/i })).toBeInTheDocument();
  });

  it('shows the error when the draft cannot start', async () => {
    startDraft.mockRejectedValue(new ApiError(502, 'Card database unreachable'));
    await begin();
    expect(await screen.findByRole('alert')).toHaveTextContent(/card database unreachable/i);
    expect(screen.getByRole('button', { name: /start draft/i })).toBeInTheDocument();
  });

  it('picks a card and shows the next pack and the pick', async () => {
    startDraft.mockResolvedValue(draft());
    pickCard.mockResolvedValue(draft({ pickNumber: 2, pack: pack(14, 100), picks: [card(3)] }));
    await begin();
    await screen.findByText('Pack 1 of 3');

    await userEvent.click(screen.getByRole('button', { name: 'Pick Card 3' }));

    expect(pickCard).toHaveBeenCalledWith('d1', 'Card 3');
    expect(await screen.findByText('Pick 2 of 15')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^pick /i })).toHaveLength(14);
    const picks = screen.getByRole('list', { name: /your picks/i });
    expect(within(picks).getByRole('img', { name: 'Card 3' })).toBeInTheDocument();
  });

  it('shows a pick error and keeps the pack', async () => {
    startDraft.mockResolvedValue(draft());
    pickCard.mockRejectedValue(new ApiError(400, 'Card is not in your pack: Card 3'));
    await begin();
    await screen.findByText('Pack 1 of 3');

    await userEvent.click(screen.getByRole('button', { name: 'Pick Card 3' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/not in your pack/i);
    expect(screen.getAllByRole('button', { name: /^pick /i })).toHaveLength(15);
  });

  it('shows the summary when the draft is finished, saves the deck and restarts', async () => {
    startDraft.mockResolvedValueOnce(draft({ round: 3, pickNumber: 15, pack: [card(1)], picks: pack(44, 200) }));
    pickCard.mockResolvedValue(draft({ round: 3, pickNumber: 15, finished: true, pack: [], picks: pack(45, 200) }));
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
