import { seatName } from './formats';

const cardNames = (cards) => cards.map((c) => c.name).join(', ');
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** One sentence for a draft event, as the service shows it to the player's seat. */
export function describeEvent(event, draft) {
  const who = event.seat === null || event.seat === undefined ? '' : seatName(event.seat, draft);
  switch (event.type) {
    case 'DRAFT_STARTED':
      return who ? `The draft started. ${who} ${who === 'You' ? 'play' : 'plays'} first.` : 'The draft started.';
    case 'ROUND_STARTED':
      return `Round ${event.round} started, passing ${event.direction === 'RIGHT' ? 'right' : 'left'}.`;
    case 'PACK_OPENED':
      return `${who} opened booster ${event.packNumber}.`;
    case 'CARD_PICKED':
      return `${who} picked ${cardNames(event.cards)}.`;
    case 'PILE_TAKEN':
      return event.cards.length > 0
        ? `${who} took pile ${event.pile}: ${cardNames(event.cards)}.`
        : `${who} took pile ${event.pile} (${plural(event.cardCount, 'card')}).`;
    case 'PILE_PASSED':
      return `${who} passed pile ${event.pile}.`;
    case 'STACK_CARD_TAKEN':
      return event.cards.length > 0
        ? `${who} took the top card of the stack: ${cardNames(event.cards)}.`
        : `${who} took the top card of the stack.`;
    case 'DRAFT_FINISHED':
      return 'The draft is over.';
    default:
      return event.type;
  }
}
