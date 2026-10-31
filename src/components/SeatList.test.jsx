import { render, screen, within } from '@testing-library/react';
import SeatList from './SeatList';

const draft = {
  format: 'CLASSIC', seat: 0,
  seats: [
    { seat: 0, you: true, name: 'Amir', kind: 'HUMAN', connected: true, pickCount: 3 },
    { seat: 1, you: false, name: 'Guest', kind: 'HUMAN', connected: false, pickCount: 2 },
    { seat: 2, you: false, name: null, kind: 'BOT', connected: false, pickCount: 4 },
  ],
};

describe('SeatList', () => {
  it('shows every seat with its picks and whether its player is online', () => {
    render(<SeatList draft={draft} />);
    const items = within(screen.getByRole('list', { name: /table/i })).getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('You');
    expect(items[0]).toHaveTextContent('3 picks');
    expect(items[1]).toHaveTextContent('Guest');
    expect(items[1]).toHaveTextContent(/offline/i);
    expect(items[2]).toHaveTextContent('Seat 2');
    expect(items[2]).toHaveTextContent(/bot/i);
  });

  it('is hidden when the player is alone with bots', () => {
    const { container } = render(<SeatList draft={{ ...draft, seats: [draft.seats[0], draft.seats[2]] }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
