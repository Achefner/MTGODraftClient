import { createContext, useContext } from 'react';

const NO_ZOOM = { show: () => {}, release: () => {} };

/** Outside a CardZoomProvider, hovering a card does nothing. */
export const CardZoomContext = createContext(NO_ZOOM);

/**
 * What a card picture uses to show itself big: `show(owner, card, {x, y})` on hover and move,
 * `release(owner)` when the cursor leaves it, a drag starts, or it goes away. A release only hides
 * the zoom its owner showed, never another card's.
 */
export function useCardZoom() {
  return useContext(CardZoomContext);
}
