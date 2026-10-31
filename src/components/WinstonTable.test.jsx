import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WinstonTable from './WinstonTable';

const card = (i) => ({ name: `Card ${i}`, imageUrl: `https://img/${i}.jpg` });
const draft = (overrides = {}) => ({
  format: 'WINSTON', seat: 0, yourTurn: true, pack: [card(1), card(2)],
  winston: { pileSizes: [2, 1, 3], currentPile: 0, stackSize: 40 }, ...overrides,
});

describe('WinstonTable', () => {
  it('shows the three piles with their size and marks the one being looked at', () => {
    render(<WinstonTable draft={draft()} onTake={jest.fn()} onPass={jest.fn()} />);
    const piles = screen.getByRole('list', { name: /piles/i });
    const items = within(piles).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('Pile 1');
    expect(items[0]).toHaveTextContent('2 cards');
    expect(items[1]).toHaveTextContent('1 card');
    expect(items[0]).toHaveAttribute('aria-current', 'true');
    expect(items[1]).not.toHaveAttribute('aria-current');
  });

  it('shows the cards of the current pile and takes or passes it', async () => {
    const onTake = jest.fn();
    const onPass = jest.fn();
    render(<WinstonTable draft={draft()} onTake={onTake} onPass={onPass} />);

    const pile = screen.getByRole('list', { name: /pile 1 cards/i });
    expect(within(pile).getAllByRole('img')).toHaveLength(2);

    await userEvent.click(screen.getByRole('button', { name: 'Take pile 1' }));
    await userEvent.click(screen.getByRole('button', { name: 'Pass pile 1' }));
    expect(onTake).toHaveBeenCalledTimes(1);
    expect(onPass).toHaveBeenCalledTimes(1);
  });

  it('says what passing the last pile means, and forbids it when nothing would be left to take', () => {
    const { rerender } = render(<WinstonTable draft={draft({ winston: { pileSizes: [2, 1, 3], currentPile: 2, stackSize: 40 } })} onTake={jest.fn()} onPass={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Pass pile 3' })).toHaveTextContent(/take the top card of the stack/i);

    rerender(<WinstonTable draft={draft({ winston: { pileSizes: [2, 1, 3], currentPile: 2, stackSize: 1 } })} onTake={jest.fn()} onPass={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Pass pile 3' })).toBeDisabled();
  });

  it('hides the cards and the buttons while the opponent plays', () => {
    render(<WinstonTable draft={draft({ yourTurn: false, pack: [] })} onTake={jest.fn()} onPass={jest.fn()} />);
    expect(screen.queryByRole('button', { name: /take pile/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('list', { name: /pile 1 cards/i })).not.toBeInTheDocument();
  });

  it('disables the buttons while busy', () => {
    render(<WinstonTable draft={draft()} onTake={jest.fn()} onPass={jest.fn()} disabled />);
    expect(screen.getByRole('button', { name: 'Take pile 1' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Pass pile 1' })).toBeDisabled();
  });
});
