import { fireEvent, render, screen, within } from '@testing-library/react';
import DraftPicks from './DraftPicks';
import { loadPickLayout } from '../domain/session';

const picks = [{ name: 'Counterspell', imageUrl: null, manaValue: 2 }, { name: 'Sol Ring', imageUrl: null, manaValue: 1 }];
const region = (label) => screen.getByRole('region', { name: `Mana value ${label}` });

describe('DraftPicks', () => {
  beforeEach(() => localStorage.clear());

  it('keeps the moves for the draft, also after the page reloads', () => {
    const { unmount } = render(<DraftPicks draftId="d1" picks={picks} total={45} />);

    fireEvent.dragStart(screen.getByRole('img', { name: 'Counterspell' }).closest('li'));
    fireEvent.drop(region('4'));

    expect(within(region('4')).getByRole('img', { name: 'Counterspell' })).toBeInTheDocument();
    expect(loadPickLayout('d1')).toMatchObject({ 'mv-4': [0] });

    unmount();
    render(<DraftPicks draftId="d1" picks={picks} total={45} />);
    expect(within(region('4')).getByRole('img', { name: 'Counterspell' })).toBeInTheDocument();
  });
});
