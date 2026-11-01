import { CURSOR_GAP, zoomPosition, zoomSize } from './zoomPosition';

const viewport = { width: 1200, height: 800 };
const zoom = { width: 300, height: 420 };
const at = (x, y, v = viewport, z = zoom) => zoomPosition({ x, y }, v, z);

describe('zoomPosition', () => {
  it('goes to the right of the cursor, centred on its height', () => {
    expect(at(100, 400)).toEqual({ left: 100 + CURSOR_GAP, top: 400 - 210 });
  });

  it('goes to the left when it does not fit on the right', () => {
    expect(at(1000, 400)).toEqual({ left: 1000 - CURSOR_GAP - 300, top: 190 });
    expect(at(1200 - CURSOR_GAP - 300, 400).left).toBe(1200 - 300);
    expect(at(1200 - CURSOR_GAP - 299, 400).left).toBe(1200 - CURSOR_GAP - 299 - CURSOR_GAP - 300);
  });

  it('sticks to the top of the window until the cursor passes its middle', () => {
    expect(at(1190, 5)).toEqual({ left: 1190 - CURSOR_GAP - 300, top: 0 });
    expect(at(1190, 150).top).toBe(0);
    expect(at(1190, 210).top).toBe(0);
    expect(at(1190, 260).top).toBe(50);
  });

  it('sticks to the bottom of the window in the same way', () => {
    expect(at(100, 795).top).toBe(800 - 420);
    expect(at(100, 590).top).toBe(800 - 420);
    expect(at(100, 500).top).toBe(290);
  });

  it('never goes off the left edge, even when it fits on neither side', () => {
    expect(at(150, 400, { width: 400, height: 800 }).left).toBe(0);
  });
});

describe('zoomSize', () => {
  it('is a card-shaped picture of a fixed width', () => {
    expect(zoomSize({ width: 1200, height: 800 })).toEqual({ width: 312, height: 436 });
  });

  it('shrinks to fit a short window', () => {
    expect(zoomSize({ width: 1200, height: 300 })).toEqual({ width: 215, height: 300 });
  });
});
