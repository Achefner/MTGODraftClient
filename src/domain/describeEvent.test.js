import { describeEvent } from './describeEvent';

const rochester = { format: 'ROCHESTER', seat: 0 };
const winston = { format: 'WINSTON', seat: 0 };
const bolt = { name: 'Lightning Bolt', imageUrl: 'x' };
const oko = { name: 'Oko, Thief of Crowns', imageUrl: 'y' };
const ev = (type, fields = {}) => ({ type, seat: null, round: null, direction: null, packNumber: null, pile: null, cardCount: null, cards: [], ...fields });

describe('describeEvent', () => {
  it('describes the start, rounds, opened boosters and the end', () => {
    expect(describeEvent(ev('DRAFT_STARTED'), rochester)).toBe('The draft started.');
    expect(describeEvent(ev('DRAFT_STARTED', { seat: 1 }), winston)).toBe('The draft started. Opponent plays first.');
    expect(describeEvent(ev('ROUND_STARTED', { round: 2, direction: 'RIGHT' }), rochester)).toBe('Round 2 started, passing right.');
    expect(describeEvent(ev('PACK_OPENED', { seat: 3, packNumber: 4, cardCount: 15 }), rochester)).toBe('Seat 3 opened booster 4.');
    expect(describeEvent(ev('PACK_OPENED', { seat: 0, packNumber: 1, cardCount: 15 }), rochester)).toBe('You opened booster 1.');
    expect(describeEvent(ev('DRAFT_FINISHED'), rochester)).toBe('The draft is over.');
  });

  it('describes picks with the card name', () => {
    expect(describeEvent(ev('CARD_PICKED', { seat: 5, cardCount: 1, cards: [bolt] }), rochester)).toBe('Seat 5 picked Lightning Bolt.');
    expect(describeEvent(ev('CARD_PICKED', { seat: 0, cardCount: 1, cards: [bolt] }), rochester)).toBe('You picked Lightning Bolt.');
  });

  it('describes Winston moves, hiding what the opponent took', () => {
    expect(describeEvent(ev('PILE_TAKEN', { seat: 1, pile: 2, cardCount: 3 }), winston)).toBe('Opponent took pile 2 (3 cards).');
    expect(describeEvent(ev('PILE_TAKEN', { seat: 1, pile: 1, cardCount: 1 }), winston)).toBe('Opponent took pile 1 (1 card).');
    expect(describeEvent(ev('PILE_TAKEN', { seat: 0, pile: 3, cardCount: 2, cards: [bolt, oko] }), winston))
      .toBe('You took pile 3: Lightning Bolt, Oko, Thief of Crowns.');
    expect(describeEvent(ev('PILE_PASSED', { seat: 1, pile: 1 }), winston)).toBe('Opponent passed pile 1.');
    expect(describeEvent(ev('STACK_CARD_TAKEN', { seat: 1, cardCount: 1 }), winston)).toBe('Opponent took the top card of the stack.');
    expect(describeEvent(ev('STACK_CARD_TAKEN', { seat: 0, cardCount: 1, cards: [oko] }), winston)).toBe('You took the top card of the stack: Oko, Thief of Crowns.');
  });

  it('falls back to the event type for anything unknown', () => {
    expect(describeEvent(ev('SOMETHING_NEW'), rochester)).toBe('SOMETHING_NEW');
  });
});
