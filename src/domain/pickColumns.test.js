import { pickColumns } from './pickColumns';

const card = (name, manaValue) => ({ name, imageUrl: null, manaValue });

describe('pickColumns', () => {
  it('has a column per mana value from 0 to 6, then 7 and more, even when empty', () => {
    expect(pickColumns([]).map((c) => c.label)).toEqual(['0', '1', '2', '3', '4', '5', '6', '7+']);
  });

  it('sorts the picks into their column, keeping the order they were picked in', () => {
    const picks = [card('Counterspell', 2), card('Black Lotus', 0), card('Mana Leak', 2), card('Emrakul', 15), card('Griselbrand', 8)];

    const columns = pickColumns(picks);

    expect(columns.find((c) => c.label === '0').cards.map((c) => c.name)).toEqual(['Black Lotus']);
    expect(columns.find((c) => c.label === '2').cards.map((c) => c.name)).toEqual(['Counterspell', 'Mana Leak']);
    expect(columns.find((c) => c.label === '7+').cards.map((c) => c.name)).toEqual(['Emrakul', 'Griselbrand']);
    expect(columns.find((c) => c.label === '5').cards).toEqual([]);
  });

  it('adds a column for cards whose mana value is unknown, only when there are some', () => {
    const columns = pickColumns([card('Old card', null), card('Bolt', 1), card('Older card', undefined)]);
    expect(columns.map((c) => c.label)).toEqual(['0', '1', '2', '3', '4', '5', '6', '7+', '?']);
    expect(columns[8].cards.map((c) => c.name)).toEqual(['Old card', 'Older card']);
  });

  it('gives every column a stable key', () => {
    expect(pickColumns([card('x', null)]).map((c) => c.key)).toEqual(['mv-0', 'mv-1', 'mv-2', 'mv-3', 'mv-4', 'mv-5', 'mv-6', 'mv-7+', 'mv-unknown']);
  });
});
