# CLAUDE.md

React front end of the draft simulator. Talks only to `../MTGODraftService` (:8082). Same
toolchain and conventions as `../MTGOEnchantWordle` (Vite + React 19, Jest + Testing Library,
Babel for Jest so no `import.meta.env`; `npm install --legacy-peer-deps`).

```bash
npm run dev     # :5174
npm test        # tests live next to the code as *.test.js(x); App.test.jsx mocks ./api/draftApi
```

- All draft rules live in the service; the client only renders the draft view it receives and
  never computes picks or passing. Display mirrors of the service: `ROUNDS` / `PACK_SIZE` /
  `BOOSTERS_PER_ROUND` in `DraftStatus.jsx`, `DEFAULT_FORMATS` in `src/domain/formats.js`
  (used until `GET /drafts/formats` answers), and `canPassPile` in `src/domain/winston.js`
  (only disables the Pass button; the service still decides).
- Formats: CLASSIC (pack in front of you), ROCHESTER (`pack` is the face-up table, `Pack` with
  label "Table"), WINSTON (`WinstonTable`: piles, the pile you look at, take or pass). Every
  action goes through `act(draftId, {type, cardName})` → `POST /drafts/{id}/actions`.
- `DraftLog` renders the view's `log` (events already filtered for your seat by the service)
  through `describeEvent`; it is shown for Rochester and Winston, where other seats' moves matter.
- Seats: `openTable` / `joinTable` return `{draftId, seat, token, view}`; the session
  `{draftId, token, seat}` goes to local storage (`domain/session.js`) and every seat call sends
  the token (`X-Seat-Token`). On load a stored seat is checked with `getDraft`; 403/404 forget it.
- Live view: `openStream` (EventSource on `/drafts/{id}/stream?token=`) while a seat is held.
  Views from the stream and from replies go through `latestView` (highest `version` wins).
  Actions send `expectedMoves: view.moves`; a 409 reloads the view and shows the message.
- `PickClock` counts down from `timer.remainingMillis` and the view's `receivedAt` (set when the
  view arrived), not from `deadline`, so a skewed browser clock does not matter.
- Tests: `App.test.jsx` mocks `./api/draftApi` and `./api/draftStream` (push updates through the
  captured `onUpdate`), and uses jsdom's localStorage and `window.history` for invite links.
- Card zoom: `CardZoomProvider` (in `App`) holds the hovered card and draws one fixed overlay with
  `pointer-events: none`; `CardImage` calls `useCardZoom()` (from `cardZoomContext.js`, kept apart
  for fast refresh). Placement rules are pure functions in `domain/zoomPosition.js`.
- Card pool order: `orderSources` puts `FEATURED_CUBE` ('Power LSV Cube') first; `StartScreen`
  selects the player's pick while it fits the format, else the first cube that fits, else random.
- `ApiError` carries the service's `{"error": …}` message so the UI can show it verbatim.
- Card pictures come straight from the draft view (`imageUrl`, Scryfall large images);
  `CardImage` falls back to `public/card-back.svg` with the name overlaid.
