# MTGODraftClient

Front end of the draft service: draft against bots, or open a table and invite friends with
a link; seats nobody takes are played by bots. Three formats: Classic and Rochester (8 seats),
Winston (2 seats). Talks to [MTGODraftService](../MTGODraftService)
on port 8082, which draws the cards from MTGODatabase.

- **Start screen**: pick the format and the card pool: the Power LSV Cube first (selected by
  default), then the other cubes by name, then random cards. Any CUBE collection
  big enough for the format (360 cards for Classic and Rochester, 90 for Winston), your name and
  whether to use the pick timer. Then draft against bots, or open a table.
- **Table**: the lobby shows the invite link (`/?join=<draftId>`) and who sits where; the host
  starts. Opening the link shows the table and asks for a name to join.
- **Coming back**: the seat is kept in the browser (local storage), so a reload or a dropped
  connection brings you back to your seat. A banner shows while the live connection is down.
- **Pick timer**: a countdown shows the time left; when it runs out the service picks for you.
- **Classic**: the pack in front of you is shown as card pictures (card back with the name
  when there is no picture). Click a card to pick it; the status line shows pack, pick and
  pass direction.
- **Rochester**: the face-up booster is the table. The status line shows the round, which
  booster and who opened it, and whose turn it is; a log lists what the other seats took.
- **Winston**: three face-down piles with their size. On your turn you see the pile you are
  looking at and take it or pass it; the log tells what the opponent did, without its cards.
- **Zoom**: hovering any card picture shows it big next to the cursor: on its right, or on its
  left when it does not fit; centred on the cursor's height but never past the window's edges.
- **Your picks** sit at the bottom in mana value columns (0 to 6, 7+, and ? for unknown), each
  a stack of overlapping cards showing their title strip, in pick order; hover one to see it.
  The end summary shows the deck the same way. The seats are listed on the side when other
  people play.
- **End**: the summary shows your picks; save them as a DECK collection in the card
  database under a name, or start a new draft.

## Run

```bash
npm install --legacy-peer-deps
npm run dev            # http://localhost:5174 (expects the draft service on :8082)
npm test
npm run lint
npm run build
```

Override the backend URL with `VITE_API_BASE_URL=http://host:port npm run dev`.

## Layout

```
src/
├── api/draftApi.js            # tables, seats, actions, deck (token in X-Seat-Token), streamUrl, ApiError
├── api/draftStream.js         # EventSource wrapper: updates and connection status
├── domain/session.js          # the seat kept in local storage, invite links
├── domain/latestView.js       # keeps the newest view (stream and replies may cross)
├── domain/formats.js          # default format list, seat names, picks per format
├── domain/describeEvent.js    # one sentence per log event
├── domain/winston.js          # when the Pass button is enabled
├── domain/sources.js          # card pool order: the featured cube (Power LSV) first
├── domain/zoomPosition.js     # where the zoomed card goes next to the cursor
├── domain/pickColumns.js      # picks grouped by mana value
├── components/StartScreen     # format, card pool, name, timer; draft against bots or open a table
├── components/JoinScreen      # the invite link's page
├── components/Lobby           # invite link, seats, host's start button
├── components/DraftStatus     # status line for each format
├── components/PickClock       # countdown of the seat's pick timer
├── components/ConnectionStatus# banner while reconnecting
├── components/Pack            # clickable card grid (your pack, or the Rochester table)
├── components/WinstonTable    # piles, the pile you look at, take or pass
├── components/DraftLog        # what happened, most recent first
├── components/SeatList        # who sits where, online or not, when other people play
├── components/PickColumns     # picks in mana value columns (draft and summary)
├── components/DraftSummary    # end of draft, save deck, new draft
├── components/CardImage       # picture with card-back fallback, reports hover to the zoom
├── components/CardZoom        # provider + overlay of the zoomed card
└── App.jsx                    # join / start → lobby → drafting → finished
```
