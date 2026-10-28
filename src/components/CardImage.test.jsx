import { fireEvent, render, screen } from '@testing-library/react';
import CardImage, { CARD_BACK_PLACEHOLDER } from './CardImage';

describe('CardImage', () => {
  it('shows the card picture with the name as alt text', () => {
    render(<CardImage card={{ name: 'Black Lotus', imageUrl: 'https://img/lotus.jpg' }} />);
    expect(screen.getByRole('img', { name: 'Black Lotus' })).toHaveAttribute('src', 'https://img/lotus.jpg');
  });

  it('shows the card back and the name when there is no picture', () => {
    render(<CardImage card={{ name: 'Black Lotus', imageUrl: null }} />);
    expect(screen.getByRole('img', { name: 'Black Lotus' })).toHaveAttribute('src', CARD_BACK_PLACEHOLDER);
    expect(screen.getByText('Black Lotus')).toBeInTheDocument();
  });

  it('falls back to the card back when the picture fails to load', () => {
    render(<CardImage card={{ name: 'Black Lotus', imageUrl: 'https://img/broken.jpg' }} />);
    fireEvent.error(screen.getByRole('img', { name: 'Black Lotus' }));
    expect(screen.getByRole('img', { name: 'Black Lotus' })).toHaveAttribute('src', CARD_BACK_PLACEHOLDER);
    expect(screen.getByText('Black Lotus')).toBeInTheDocument();
  });
});
