import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DraftSummary from './DraftSummary';

const picks = [{ name: 'Black Lotus', imageUrl: null, manaValue: 0 }, { name: 'Sol Ring', imageUrl: null, manaValue: 1 }];

describe('DraftSummary', () => {
  it('announces the end and shows the picks by mana value', () => {
    render(<DraftSummary picks={picks} onSave={jest.fn()} onRestart={jest.fn()} />);
    expect(screen.getByRole('heading', { name: /draft complete/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Your deck (2)' })).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'Mana value 1' })).getByRole('img', { name: 'Sol Ring' })).toBeInTheDocument();
  });

  it('saves the deck under the typed name', async () => {
    const onSave = jest.fn().mockResolvedValue({ collectionId: 'k1', name: 'My deck', cardCount: 2 });
    render(<DraftSummary picks={picks} onSave={onSave} onRestart={jest.fn()} />);
    await userEvent.type(screen.getByRole('textbox', { name: /deck name/i }), 'My deck');
    await userEvent.click(screen.getByRole('button', { name: /save deck/i }));
    expect(onSave).toHaveBeenCalledWith('My deck');
    expect(await screen.findByText(/saved as "My deck" \(2 cards\)/i)).toBeInTheDocument();
  });

  it('shows the error when saving fails', async () => {
    const onSave = jest.fn().mockRejectedValue(new Error('Card database unreachable'));
    render(<DraftSummary picks={picks} onSave={onSave} onRestart={jest.fn()} />);
    await userEvent.type(screen.getByRole('textbox', { name: /deck name/i }), 'x');
    await userEvent.click(screen.getByRole('button', { name: /save deck/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/card database unreachable/i);
  });

  it('does not save with a blank name', async () => {
    const onSave = jest.fn();
    render(<DraftSummary picks={picks} onSave={onSave} onRestart={jest.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /save deck/i }));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('offers to start a new draft', async () => {
    const onRestart = jest.fn();
    render(<DraftSummary picks={picks} onSave={jest.fn()} onRestart={onRestart} />);
    await userEvent.click(screen.getByRole('button', { name: /new draft/i }));
    expect(onRestart).toHaveBeenCalledTimes(1);
  });
});
