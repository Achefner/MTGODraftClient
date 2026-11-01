/** Space between the cursor and the zoomed card, so the card is never under the cursor. */
export const CURSOR_GAP = 16;

const ZOOM_WIDTH = 312;
const CARD_RATIO = 88 / 63; // height / width of a Magic card

/** The zoomed card's size: a fixed width, shrunk when the window is too short for it. */
export function zoomSize(viewport) {
  const height = Math.round(ZOOM_WIDTH * CARD_RATIO);
  if (height <= viewport.height) return { width: ZOOM_WIDTH, height };
  return { width: Math.round(viewport.height / CARD_RATIO), height: viewport.height };
}

/**
 * Where the zoomed card goes for a cursor at `{x, y}`, in window coordinates.
 * Horizontally: on the right of the cursor if it fits, else on its left (never past the left edge).
 * Vertically: centred on the cursor, but kept inside the window, so near the top it sticks to the
 * top edge until the cursor passes its middle, and likewise at the bottom.
 */
export function zoomPosition(cursor, viewport, size) {
  const fitsRight = cursor.x + CURSOR_GAP + size.width <= viewport.width;
  const left = fitsRight ? cursor.x + CURSOR_GAP : Math.max(0, cursor.x - CURSOR_GAP - size.width);
  const centred = cursor.y - size.height / 2;
  const top = Math.min(Math.max(0, centred), Math.max(0, viewport.height - size.height));
  return { left, top };
}
