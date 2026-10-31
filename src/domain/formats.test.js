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

  it('names seats: you, a player by name, the Winston opponent, or a seat number', () => {
    const seats = [{ kind: 'HUMAN', name: 'Amir' }, { kind: 'HUMAN', name: 'Guest' }, { kind: 'BOT', name: null }, { kind: 'BOT', name: null }];
    expect(seatName(0, { format: 'CLASSIC', seat: 0, seats })).toBe('You');
    expect(seatName(1, { format: 'ROCHESTER', seat: 0, seats })).toBe('Guest');
    expect(seatName(1, { format: 'WINSTON', seat: 0, seats: [seats[0], seats[2]] })).toBe('Opponent');
    expect(seatName(3, { format: 'ROCHESTER', seat: 0, seats })).toBe('Seat 3');
    expect(seatName(3, { format: 'ROCHESTER', seat: 0 })).toBe('Seat 3');
  });

  it('booster formats end at 45 picks, Winston has no fixed total', () => {
    expect(totalPicks('CLASSIC')).toBe(45);
    expect(totalPicks('ROCHESTER')).toBe(45);
    expect(totalPicks('WINSTON')).toBeUndefined();
  });
});
