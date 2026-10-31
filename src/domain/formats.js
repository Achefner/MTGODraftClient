/** Used until the service's format list arrives, and if it cannot be loaded. Mirrors GET /drafts/formats. */
export const DEFAULT_FORMATS = [
  {
    name: 'CLASSIC', displayName: 'Classic', seats: 8, cardsNeeded: 360,
    description: '8 players open 3 boosters of 15 cards, one per round, pick one card and pass the rest: left, then right, then left.',
  },
  {
    name: 'ROCHESTER', displayName: 'Rochester', seats: 8, cardsNeeded: 360,
    description: '8 players, 3 boosters of 15 each. One booster at a time is laid face up; players pick in turn, the last one picks twice and the order snakes back.',
  },
  {
    name: 'WINSTON', displayName: 'Winston', seats: 2, cardsNeeded: 90,
    description: '2 players, 90 cards in a stack and 3 face-down piles. Look at each pile in turn: take it, or add a card to it and move on.',
  },
];

const BOOSTER_PICKS = 45;

/** The named format from the list, else the built-in one, else Classic. */
export function findFormat(formats, name) {
  return formats.find((f) => f.name === name)
    ?? DEFAULT_FORMATS.find((f) => f.name === name)
    ?? DEFAULT_FORMATS[0];
}

/** "You" for the player's seat, a player's name, "Opponent" for the Winston bot, else "Seat n". */
export function seatName(seat, draft) {
  if (seat === draft.seat) return 'You';
  const other = draft.seats?.[seat];
  if (other?.kind === 'HUMAN' && other.name) return other.name;
  if (draft.format === 'WINSTON') return 'Opponent';
  return `Seat ${seat}`;
}

/** How many cards a player ends with, when the format fixes it. */
export function totalPicks(format) {
  return format === 'WINSTON' ? undefined : BOOSTER_PICKS;
}
