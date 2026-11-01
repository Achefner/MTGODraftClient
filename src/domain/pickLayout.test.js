import { arrangePicks, movePick } from './pickLayout';

const card = (name, manaValue) => ({ name, imageUrl: null, manaValue });
const names = (column) => column.picks.map((p) => p.card.name);
const column = (columns, label) => columns.find((c) => c.label === label);

// picks in pick order: index 0 Counterspell, 1 Black Lotus, 2 Mana Leak, 3 Emrakul, 4 Griselbrand
const picks = [card('Counterspell', 2), card('Black Lotus', 0), card('Mana Leak', 2), card('Emrakul', 15), card('Griselbrand', 8)];

describe('arrangePicks', () => {
  it('has a column per mana value from 0 to 6, then 7 and more, even when empty', () => {
    expect(arrangePicks([]).map((c) => c.label)).toEqual(['0', '1', '2', '3', '4', '5', '6', '7+']);
    expect(arrangePicks([]).map((c) => c.key)).toEqual(['mv-0', 'mv-1', 'mv-2', 'mv-3', 'mv-4', 'mv-5', 'mv-6', 'mv-7+']);
  });

  it('without a layout, puts each pick in its mana value column, in pick order', () => {
    const columns = arrangePicks(picks);
    expect(names(column(columns, '0'))).toEqual(['Black Lotus']);
    expect(names(column(columns, '2'))).toEqual(['Counterspell', 'Mana Leak']);
    expect(names(column(columns, '7+'))).toEqual(['Emrakul', 'Griselbrand']);
    expect(column(columns, '2').picks.map((p) => p.index)).toEqual([0, 2]);
  });

  it('adds a column for unknown mana values only when needed', () => {
    const columns = arrangePicks([card('Old card', null), card('Bolt', 1)]);
    expect(columns.map((c) => c.label)).toEqual(['0', '1', '2', '3', '4', '5', '6', '7+', '?']);
    expect(columns[8]).toMatchObject({ key: 'mv-unknown' });
    expect(names(columns[8])).toEqual(['Old card']);
  });

  it('follows the layout, and puts picks it does not mention in their mana value column', () => {
    const layout = { 'mv-0': [2, 1], 'mv-5': [3] };

    const columns = arrangePicks(picks, layout);

    expect(names(column(columns, '0'))).toEqual(['Mana Leak', 'Black Lotus']);
    expect(names(column(columns, '5'))).toEqual(['Emrakul']);
    expect(names(column(columns, '2'))).toEqual(['Counterspell']);
    expect(names(column(columns, '7+'))).toEqual(['Griselbrand']);
  });

  it('ignores what a layout says about picks that do not exist, twice-placed picks and unknown columns', () => {
    const columns = arrangePicks(picks.slice(0, 2), { 'mv-3': [0, 0, 7], nonsense: [1] });
    expect(names(column(columns, '3'))).toEqual(['Counterspell']);
    expect(names(column(columns, '0'))).toEqual(['Black Lotus']);
    expect(columns.flatMap((c) => c.picks)).toHaveLength(2);
  });
});

describe('movePick', () => {
  it('moves a pick to the end of another column', () => {
    const layout = movePick(arrangePicks(picks), 0, 'mv-5');
    const columns = arrangePicks(picks, layout);
    expect(names(column(columns, '5'))).toEqual(['Counterspell']);
    expect(names(column(columns, '2'))).toEqual(['Mana Leak']);
  });

  it('moves a pick above another card', () => {
    const layout = movePick(arrangePicks(picks), 1, 'mv-2', 2);
    expect(names(column(arrangePicks(picks, layout), '2'))).toEqual(['Counterspell', 'Black Lotus', 'Mana Leak']);
  });

  it('reorders within a column', () => {
    const layout = movePick(arrangePicks(picks), 2, 'mv-2', 0);
    expect(names(column(arrangePicks(picks, layout), '2'))).toEqual(['Mana Leak', 'Counterspell']);
  });

  it('dropping a card on itself changes nothing', () => {
    const before = arrangePicks(picks);
    expect(arrangePicks(picks, movePick(before, 2, 'mv-2', 2))).toEqual(before);
  });

  it('keeps every pick exactly once', () => {
    let layout = {};
    layout = movePick(arrangePicks(picks, layout), 3, 'mv-1');
    layout = movePick(arrangePicks(picks, layout), 4, 'mv-1', 3);
    layout = movePick(arrangePicks(picks, layout), 1, 'mv-1');
    const all = Object.values(layout).flat().sort();
    expect(all).toEqual([0, 1, 2, 3, 4]);
    expect(names(column(arrangePicks(picks, layout), '1'))).toEqual(['Griselbrand', 'Emrakul', 'Black Lotus']);
  });
});
