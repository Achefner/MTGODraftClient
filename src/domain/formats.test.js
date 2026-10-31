import { DEFAULT_FORMATS, findFormat, seatName, totalPicks } from './formats';

describe('formats', () => {
  it('knows the three formats the service offers', () => {
    expect(DEFAULT_FORMATS.map((f) => f.name)).toEqual(['CLASSIC', 'ROCHESTER', 'WINSTON']);
    expect(DEFAULT_FORMATS.map((f) => f.cardsNeeded)).toEqual([360, 360, 90]);
  });

  it('finds a format by name, falling back to Classic', () => {
    expect(findFormat(DEFAULT_FORMATS, 'WINSTON').seats).toBe(2);
    expect(findFormat(DEFAULT_FORMATS, 'NOPE').name).toBe('CLASSIC');
    expect(findFormat([], 'WINSTON').name).toBe('WINSTON');
  });

  it('names seats: you, the Winston opponent, or a seat number', () => {
    expect(seatName(0, { format: 'CLASSIC', seat: 0 })).toBe('You');
    expect(seatName(1, { format: 'WINSTON', seat: 0 })).toBe('Opponent');
    expect(seatName(3, { format: 'ROCHESTER', seat: 0 })).toBe('Seat 3');
  });

  it('booster formats end at 45 picks, Winston has no fixed total', () => {
    expect(totalPicks('CLASSIC')).toBe(45);
    expect(totalPicks('ROCHESTER')).toBe(45);
    expect(totalPicks('WINSTON')).toBeUndefined();
  });
});
