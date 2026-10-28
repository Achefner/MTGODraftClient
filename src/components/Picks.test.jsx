import { render, screen, within } from '@testing-library/react';
import Picks from './Picks';

describe('Picks', () => {
  it('shows the count and the picked cards, most recent first', () => {
    render(<Picks picks={[{ name: 'Black Lotus', imageUrl: null }, { name: 'Sol Ring', imageUrl: null }]} total={45} />);
    expect(screen.getByRole('heading', { name: /your picks \(2\/45\)/i })).toBeInTheDocument();
    const items = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(items.map((i) => i.textContent)).toEqual(['Sol Ring', 'Black Lotus']);
  });

  it('shows a hint when nothing has been picked', () => {
    render(<Picks picks={[]} total={45} />);
    expect(screen.getByText(/no picks yet/i)).toBeInTheDocument();
  });
});
