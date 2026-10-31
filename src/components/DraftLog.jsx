import { describeEvent } from '../domain/describeEvent';

/** What the player has seen happen in the draft, most recent first. */
export default function DraftLog({ draft }) {
  if (draft.log.length === 0) return null;
  return (
    <section className="draft-log">
      <h2 id="draft-log-heading">What happened</h2>
      <ul aria-labelledby="draft-log-heading">
        {[...draft.log].reverse().map((event, index) => (
          <li key={draft.log.length - index}>{describeEvent(event, draft)}</li>
        ))}
      </ul>
    </section>
  );
}
