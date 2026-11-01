/** The cube offered first, and selected by default, on the start screen. */
export const FEATURED_CUBE = 'Power LSV Cube';

/** The featured cube first, then the other cubes by name. */
export function orderSources(sources) {
  return [...sources].sort((a, b) => {
    if (a.name === FEATURED_CUBE) return -1;
    if (b.name === FEATURED_CUBE) return 1;
    return a.name.localeCompare(b.name);
  });
}
