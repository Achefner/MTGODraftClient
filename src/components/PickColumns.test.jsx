import { fireEvent, render, screen, within } from '@testing-library/react';
import PickColumns from './PickColumns';

const card = (name, manaValue) => ({ name, imageUrl: null, manaValue });
// pick indexes: 0 Counterspell, 1 Black Lotus, 2 Mana Leak, 3 Emrakul
const picks = [card('Counterspell', 2), card('Black Lotus', 0), card('Mana Leak', 2), card('Emrakul, the Aeons Torn', 15)];
const region = (label) => screen.getByRole('region', { name: `Mana value ${label}` });
const namesIn = (label) => within(region(label)).queryAllByRole('img').map((img) => img.getAttribute('alt'));
const item = (name) => screen.getByRole('img', { name }).closest('li');

describe('PickColumns', () => {
  it('shows the picks in mana value columns, with the count of each', () => {
    render(<PickColumns picks={picks} total={45} />);

    expect(screen.getByRole('heading', { name: 'Your picks (4/45)' })).toBeInTheDocument();
    expect(within(region('2')).getByRole('heading', { name: '2 (2)' })).toBeInTheDocument();
    expect(namesIn('2')).toEqual(['Counterspell', 'Mana Leak']);
    expect(namesIn('7+')).toEqual(['Emrakul, the Aeons Torn']);
    expect(namesIn('4')).toEqual([]);
  });

  it('follows the layout it is given', () => {
    render(<PickColumns picks={picks} layout={{ 'mv-5': [2] }} />);
    expect(namesIn('5')).toEqual(['Mana Leak']);
    expect(namesIn('2')).toEqual(['Counterspell']);
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

  it('is not draggable without a place to report moves', () => {
    render(<PickColumns picks={picks} />);
    expect(item('Counterspell')).not.toHaveAttribute('draggable', 'true');
  });

  it('drags a card to the end of another column', () => {
    const onMove = jest.fn();
    render(<PickColumns picks={picks} onMove={onMove} />);
    expect(item('Counterspell')).toHaveAttribute('draggable', 'true');

    fireEvent.dragStart(item('Counterspell'), { dataTransfer: { setData: jest.fn() } });
    fireEvent.dragOver(region('5'));
    expect(region('5')).toHaveClass('pick-column--over');
    fireEvent.drop(region('5'));

    expect(onMove).toHaveBeenCalledWith(expect.objectContaining({ 'mv-5': [0], 'mv-2': [2] }));
    expect(region('5')).not.toHaveClass('pick-column--over');
  });

  it('drags a card above another one', () => {
    const onMove = jest.fn();
    render(<PickColumns picks={picks} onMove={onMove} />);

    fireEvent.dragStart(item('Black Lotus'));
    fireEvent.drop(item('Mana Leak'));

    expect(onMove).toHaveBeenCalledTimes(1);
    expect(onMove.mock.calls[0][0]).toMatchObject({ 'mv-2': [0, 1, 2], 'mv-0': [] });
  });

  it('ignores drops that do not come from a pick', () => {
    const onMove = jest.fn();
    render(<PickColumns picks={picks} onMove={onMove} />);
    fireEvent.dragOver(region('5'));
    fireEvent.drop(region('5'));
    expect(onMove).not.toHaveBeenCalled();
  });

  it('forgets the drag when it ends outside a column', () => {
    const onMove = jest.fn();
    render(<PickColumns picks={picks} onMove={onMove} />);
    fireEvent.dragStart(item('Counterspell'));
    expect(item('Counterspell')).toHaveClass('pick-column__card--dragging');
    fireEvent.dragEnd(item('Counterspell'));

    fireEvent.drop(region('5'));

    expect(onMove).not.toHaveBeenCalled();
    expect(item('Counterspell')).not.toHaveClass('pick-column__card--dragging');
  });
});
