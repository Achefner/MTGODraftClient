import { FEATURED_CUBE, orderSources } from './sources';

describe('orderSources', () => {
  it('puts the featured cube first, then the other cubes by name', () => {
    const sources = [
      { id: 'a', name: 'Vintage Cube', cardCount: 540 },
      { id: 'b', name: FEATURED_CUBE, cardCount: 527 },
      { id: 'c', name: 'Arena Cube', cardCount: 450 },
    ];
    expect(orderSources(sources).map((s) => s.id)).toEqual(['b', 'c', 'a']);
  });

  it('works without the featured cube', () => {
    expect(orderSources([{ id: 'z', name: 'Z' }, { id: 'y', name: 'Y' }]).map((s) => s.id)).toEqual(['y', 'z']);
    expect(orderSources([])).toEqual([]);
  });

  it('features the Power LSV Cube', () => {
    expect(FEATURED_CUBE).toBe('Power LSV Cube');
  });
});
