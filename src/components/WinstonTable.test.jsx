import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WinstonTable from './WinstonTable';

const card = (i) => ({ name: `Card ${i}`, imageUrl: `https://img/${i}.jpg`, manaValue: 1 });
const draft = (overrides = {}) => ({
  format: 'WINSTON', seat: 0, yourTurn: true, pack: [card(1), card(2)],
  winston: { pileSizes: [2, 1, 3], currentPile: 0, stackSize: 40 }, ...overrides,
});
const pile = (n) => screen.getByRole('region', { name: `Pile ${n}` });
const backs = (region) => within(region).queryAllByRole('presentation');

describe('WinstonTable', () => {
  it('shows every pile with all its cards, the current one face up, the others face down', () => {
    render(<WinstonTable draft={draft()} onTake={jest.fn()} onPass={jest.fn()} />);

    expect(within(pile(1)).getAllByRole('img').map((img) => img.getAttribute('alt'))).toEqual(['Card 1', 'Card 2']);
    expect(backs(pile(1))).toHaveLength(0);
    expect(backs(pile(2))).toHaveLength(1);
    expect(backs(pile(3))).toHaveLength(3);
    expect(within(pile(3)).getByRole('heading', { name: 'Pile 3 · 3 cards' })).toBeInTheDocument();
    expect(pile(1)).toHaveAttribute('aria-current', 'true');
    expect(pile(2)).not.toHaveAttribute('aria-current');
  });

  it('shows the stack face down with its size', () => {
    render(<WinstonTable draft={draft()} onTake={jest.fn()} onPass={jest.fn()} />);
    const stack = screen.getByRole('region', { name: 'Stack' });
    expect(within(stack).getByRole('heading', { name: 'Stack · 40 cards' })).toBeInTheDocument();
    expect(backs(stack).length).toBeGreaterThan(0);
  });

  it('takes the current pile by clicking it', async () => {
    const onTake = jest.fn();
    render(<WinstonTable draft={draft()} onTake={onTake} onPass={jest.fn()} />);

    await userEvent.click(within(pile(1)).getByRole('button', { name: 'Take pile 1 (2 cards)' }));

    expect(onTake).toHaveBeenCalledTimes(1);
    expect(within(pile(2)).queryByRole('button')).not.toBeInTheDocument();
    expect(within(pile(3)).queryByRole('button')).not.toBeInTheDocument();
  });

  it('skips the current pile with the skip button', async () => {
    const onPass = jest.fn();
    render(<WinstonTable draft={draft({ winston: { pileSizes: [2, 1, 3], currentPile: 1, stackSize: 40 }, pack: [card(5)] })} onTake={jest.fn()} onPass={onPass} />);

    expect(within(pile(2)).getByRole('button', { name: 'Take pile 2 (1 card)' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Skip pile 2' }));

    expect(onPass).toHaveBeenCalledTimes(1);
    expect(backs(pile(1))).toHaveLength(2);
  });

  it('says that skipping the last pile takes the top card of the stack, and forbids it when nothing would be left', () => {
    const { rerender } = render(<WinstonTable draft={draft({ winston: { pileSizes: [2, 1, 3], currentPile: 2, stackSize: 40 } })} onTake={jest.fn()} onPass={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Skip pile 3, take the top card of the stack' })).toBeEnabled();

    rerender(<WinstonTable draft={draft({ winston: { pileSizes: [2, 1, 3], currentPile: 2, stackSize: 1 } })} onTake={jest.fn()} onPass={jest.fn()} />);
    expect(screen.getByRole('button', { name: /skip pile 3/i })).toBeDisabled();
  });

  it('shows everything face down and nothing to click while the opponent plays', () => {
    render(<WinstonTable draft={draft({ yourTurn: false, pack: [] })} onTake={jest.fn()} onPass={jest.fn()} />);

    expect(backs(pile(1))).toHaveLength(2);
    expect(screen.queryByRole('img', { name: /card \d/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(pile(1)).not.toHaveAttribute('aria-current');
  });

  it('marks an empty pile', () => {
    render(<WinstonTable draft={draft({ yourTurn: false, pack: [], winston: { pileSizes: [0, 1, 2], currentPile: 1, stackSize: 0 } })} onTake={jest.fn()} onPass={jest.fn()} />);
    expect(within(pile(1)).getByText('Empty')).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'Stack' })).getByText('Empty')).toBeInTheDocument();
  });

  it('disables taking and skipping while busy', () => {
    render(<WinstonTable draft={draft()} onTake={jest.fn()} onPass={jest.fn()} disabled />);
    expect(screen.getByRole('button', { name: /take pile 1/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Skip pile 1' })).toBeDisabled();
  });
});
