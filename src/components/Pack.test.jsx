import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pack from './Pack';

const cards = [
  { name: 'Black Lotus', imageUrl: 'https://img/lotus.jpg' },
  { name: 'Sol Ring', imageUrl: 'https://img/sol.jpg' },
];

describe('Pack', () => {
  it('renders one button per card, in pack order', () => {
    render(<Pack cards={cards} onPick={jest.fn()} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual(['Pick Black Lotus', 'Pick Sol Ring']);
    expect(screen.getByRole('img', { name: 'Sol Ring' })).toBeInTheDocument();
  });

  it('calls onPick with the card name when clicked', async () => {
    const onPick = jest.fn();
    render(<Pack cards={cards} onPick={onPick} />);
    await userEvent.click(screen.getByRole('button', { name: 'Pick Sol Ring' }));
    expect(onPick).toHaveBeenCalledWith('Sol Ring');
  });

  it('disables picking while busy', async () => {
    const onPick = jest.fn();
    render(<Pack cards={cards} onPick={onPick} disabled />);
    expect(screen.getByRole('button', { name: 'Pick Sol Ring' })).toBeDisabled();
  });

  it('says so when the pack is empty', () => {
    render(<Pack cards={[]} onPick={jest.fn()} />);
    expect(screen.getByText(/no cards left/i)).toBeInTheDocument();
  });
});
