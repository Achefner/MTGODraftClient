import { canPassPile } from './winston';

describe('canPassPile', () => {
  it('allows passing while the stack can refill the pile and still give a card', () => {
    expect(canPassPile({ pileSizes: [1, 1, 1], currentPile: 2, stackSize: 2 })).toBe(true);
    expect(canPassPile({ pileSizes: [1, 1, 1], currentPile: 0, stackSize: 50 })).toBe(true);
  });

  it('allows passing to a later pile even with an empty stack', () => {
    expect(canPassPile({ pileSizes: [2, 0, 1], currentPile: 0, stackSize: 0 })).toBe(true);
  });

  it('forbids passing when it would leave nothing to take', () => {
    expect(canPassPile({ pileSizes: [1, 1, 1], currentPile: 2, stackSize: 1 })).toBe(false);
    expect(canPassPile({ pileSizes: [2, 1, 0], currentPile: 1, stackSize: 0 })).toBe(false);
  });
});
