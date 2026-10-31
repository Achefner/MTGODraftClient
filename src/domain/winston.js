/**
 * Same rule as the service: passing must leave something to take, either a later non-empty pile
 * or, after one stack card refills this pile, another stack card to draw.
 */
export function canPassPile({ pileSizes, currentPile, stackSize }) {
  const laterPile = pileSizes.slice(currentPile + 1).some((size) => size > 0);
  return laterPile || stackSize >= 2;
}
