import { fireEvent, render, screen } from '@testing-library/react';
import CardImage from './CardImage';
import { CardZoomProvider } from './CardZoom';
import { CURSOR_GAP } from '../domain/zoomPosition';

const bolt = { name: 'Lightning Bolt', imageUrl: 'https://img/bolt.jpg' };

const renderCard = (card = bolt) => render(<CardZoomProvider><CardImage card={card} /></CardZoomProvider>);
const zoom = () => screen.queryByTestId('card-zoom');

describe('card zoom', () => {
  beforeEach(() => {
    window.innerWidth = 1200;
    window.innerHeight = 800;
  });

  it('shows the card big next to the cursor while hovering it', () => {
    renderCard();
    expect(zoom()).not.toBeInTheDocument();

    fireEvent.mouseMove(screen.getByRole('img', { name: 'Lightning Bolt' }), { clientX: 100, clientY: 400 });

    expect(zoom()).toBeInTheDocument();
    expect(zoom().querySelector('img')).toHaveAttribute('src', 'https://img/bolt.jpg');
    expect(zoom()).toHaveStyle({ left: `${100 + CURSOR_GAP}px`, top: `${400 - 218}px`, width: '312px', height: '436px' });
  });

  it('follows the cursor and switches to the left near the right edge', () => {
    renderCard();
    const card = screen.getByRole('img', { name: 'Lightning Bolt' });

    fireEvent.mouseEnter(card, { clientX: 1100, clientY: 5 });

    expect(zoom()).toHaveStyle({ left: `${1100 - CURSOR_GAP - 312}px`, top: '0px' });

    fireEvent.mouseMove(card, { clientX: 1100, clientY: 700 });
    expect(zoom()).toHaveStyle({ top: `${800 - 436}px` });
  });

  it('disappears when the cursor leaves the card', () => {
    renderCard();
    const card = screen.getByRole('img', { name: 'Lightning Bolt' });
    fireEvent.mouseMove(card, { clientX: 100, clientY: 400 });

    fireEvent.mouseLeave(card);

    expect(zoom()).not.toBeInTheDocument();
  });

  it('does not zoom a card without a picture', () => {
    renderCard({ name: 'Unknown', imageUrl: null });
    fireEvent.mouseMove(screen.getByRole('img', { name: 'Unknown' }), { clientX: 100, clientY: 400 });
    expect(zoom()).not.toBeInTheDocument();
  });

  it('does not zoom a picture that failed to load', () => {
    renderCard();
    const card = screen.getByRole('img', { name: 'Lightning Bolt' });
    fireEvent.error(card);
    fireEvent.mouseMove(card, { clientX: 100, clientY: 400 });
    expect(zoom()).not.toBeInTheDocument();
  });

  it('is ignored by screen readers and never catches the mouse', () => {
    renderCard();
    fireEvent.mouseMove(screen.getByRole('img', { name: 'Lightning Bolt' }), { clientX: 100, clientY: 400 });
    expect(zoom()).toHaveAttribute('aria-hidden', 'true');
    expect(zoom()).toHaveClass('card-zoom');
  });

  it('leaves cards alone outside a provider', () => {
    render(<CardImage card={bolt} />);
    fireEvent.mouseMove(screen.getByRole('img', { name: 'Lightning Bolt' }), { clientX: 100, clientY: 400 });
    expect(zoom()).not.toBeInTheDocument();
  });
});
