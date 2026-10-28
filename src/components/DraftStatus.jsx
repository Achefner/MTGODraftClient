export const ROUNDS = 3;
export const PACK_SIZE = 15;

/** "Pack 2 of 3 · Pick 7 of 15 · passing right" */
export default function DraftStatus({ draft }) {
  return (
    <div className="draft-status" aria-live="polite">
      <span className="draft-status__item">Pack {draft.round} of {ROUNDS}</span>
      <span className="draft-status__item">Pick {draft.pickNumber} of {PACK_SIZE}</span>
      <span className="draft-status__item draft-status__direction">
        {draft.direction === 'LEFT' ? '← passing left' : 'passing right →'}
      </span>
    </div>
  );
}
