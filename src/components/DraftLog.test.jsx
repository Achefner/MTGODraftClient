import { render, screen, within } from '@testing-library/react';
import DraftLog from './DraftLog';

const draft = {
  format: 'ROCHESTER', seat: 0,
  log: [
    { type: 'PACK_OPENED', seat: 1, packNumber: 2, cards: [] },
    { type: 'CARD_PICKED', seat: 1, cards: [{ name: 'Lightning Bolt' }] },
    { type: 'CARD_PICKED', seat: 2, cards: [{ name: 'Counterspell' }] },
  ],
};

describe('DraftLog', () => {
  it('lists what happened, most recent first', () => {
    render(<DraftLog draft={draft} />);
    const items = within(screen.getByRole('list', { name: /what happened/i })).getAllByRole('listitem');
    expect(items.map((li) => li.textContent)).toEqual(['Seat 2 picked Counterspell.', 'Seat 1 picked Lightning Bolt.', 'Seat 1 opened booster 2.']);
  });

  it('renders nothing without events', () => {
    const { container } = render(<DraftLog draft={{ ...draft, log: [] }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
