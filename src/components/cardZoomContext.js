import { createContext, useContext } from 'react';

const NO_ZOOM = { show: () => {}, hide: () => {} };

/** Outside a CardZoomProvider, hovering a card does nothing. */
export const CardZoomContext = createContext(NO_ZOOM);

/** What a card picture uses to show itself big: `show(card, {x, y})` on hover and move, `hide()` on leave. */
export function useCardZoom() {
  return useContext(CardZoomContext);
}
