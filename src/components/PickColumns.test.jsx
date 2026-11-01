import { render, screen, within } from '@testing-library/react';
import PickColumns from './PickColumns';

const card = (name, manaValue) => ({ name, imageUrl: null, manaValue });
const picks = [card('Counterspell', 2), card('Black Lotus', 0), card('Mana Leak', 2), card('Emrakul, the Aeons Torn', 15)];

describe('PickColumns', () => {
  it('shows the picks in mana value columns, with the count of each', () => {
    render(<PickColumns picks={picks} total={45} />);

    expect(screen.getByRole('heading', { name: 'Your picks (4/45)' })).toBeInTheDocument();
    const two = screen.getByRole('region', { name: 'Mana value 2' });
    expect(within(two).getByRole('heading', { name: '2 (2)' })).toBeInTheDocument();
    expect(within(two).getAllByRole('img').map((img) => img.getAttribute('alt'))).toEqual(['Counterspell', 'Mana Leak']);
    expect(within(screen.getByRole('region', { name: 'Mana value 7+' })).getByRole('img', { name: /emrakul/i })).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'Mana value 4' })).queryAllByRole('img')).toHaveLength(0);
  });

  it('can be titled differently, with or without a total', () => {
    render(<PickColumns picks={picks} title="Your deck" />);
    expect(screen.getByRole('heading', { name: 'Your deck (4)' })).toBeInTheDocument();
  });

  it('says so when nothing is picked yet', () => {
    render(<PickColumns picks={[]} total={45} />);
    expect(screen.getByText(/no picks yet/i)).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /mana value/i })).not.toBeInTheDocument();
  });
});
