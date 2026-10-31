import { latestView } from './latestView';

describe('latestView', () => {
  it('keeps the view with the highest version, accepting equal ones (presence changes)', () => {
    const v5 = { id: 'd1', version: 5 };
    expect(latestView(null, v5)).toBe(v5);
    expect(latestView(v5, { id: 'd1', version: 4 })).toBe(v5);
    const v5b = { id: 'd1', version: 5, seats: [] };
    expect(latestView(v5, v5b)).toBe(v5b);
    const v6 = { id: 'd1', version: 6 };
    expect(latestView(v5, v6)).toBe(v6);
  });

  it('takes any view of another draft', () => {
    const other = { id: 'd2', version: 1 };
    expect(latestView({ id: 'd1', version: 9 }, other)).toBe(other);
  });
});
