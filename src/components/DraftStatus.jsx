import { seatName } from '../domain/formats';

export const ROUNDS = 3;
export const PACK_SIZE = 15;
export const BOOSTERS_PER_ROUND = 8;

const Item = ({ children, className = '' }) => <span className={`draft-status__item ${className}`}>{children}</span>;

function Direction({ direction }) {
  return <Item className="draft-status__direction">{direction === 'LEFT' ? '← passing left' : 'passing right →'}</Item>;
}

function Turn({ draft }) {
  return <Item className="draft-status__turn">{draft.yourTurn ? 'Your turn' : `${seatName(draft.activeSeat, draft)}'s turn`}</Item>;
}

/** Where the draft stands, in the words of its format. */
export default function DraftStatus({ draft }) {
  let items;
  if (draft.format === 'ROCHESTER') {
    items = (
      <>
        <Item>Round {draft.round} of {ROUNDS}</Item>
        <Item>Booster {draft.packNumber} of {BOOSTERS_PER_ROUND}, opened by {seatName(draft.opener, draft)}</Item>
        <Item>Pick {draft.pickNumber} of {PACK_SIZE}</Item>
        <Direction direction={draft.direction} />
        <Turn draft={draft} />
      </>
    );
  } else if (draft.format === 'WINSTON') {
    items = (
      <>
        <Item>{draft.winston.stackSize} cards in the stack</Item>
        <Turn draft={draft} />
      </>
    );
  } else {
    items = (
      <>
        <Item>Pack {draft.round} of {ROUNDS}</Item>
        <Item>Pick {draft.pickNumber} of {PACK_SIZE}</Item>
        <Direction direction={draft.direction} />
      </>
    );
  }
  return <div className="draft-status" aria-live="polite">{items}</div>;
}
