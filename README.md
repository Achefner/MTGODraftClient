# MTGODraftClient

Front end of a simulated draft: you sit at seat 0, every other seat is a bot playing at
random. Three formats: Classic and Rochester (8 seats), Winston (2 seats). Talks to [MTGODraftService](../MTGODraftService)
on port 8082, which draws the cards from MTGODatabase.

- **Start screen**: pick the format and the card pool, random cards or any CUBE collection
  big enough for the format (360 cards for Classic and Rochester, 90 for Winston), then start.
- **Classic**: the pack in front of you is shown as card pictures (card back with the name
  when there is no picture). Click a card to pick it; the status line shows pack, pick and
  pass direction.
- **Rochester**: the face-up booster is the table. The status line shows the round, which
  booster and who opened it, and whose turn it is; a log lists what the other seats took.
- **Winston**: three face-down piles with their size. On your turn you see the pile you are
  looking at and take it or pass it; the log tells what the opponent did, without its cards.
- Your picks are listed on the side.
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
├── api/draftApi.js            # startDraft / getDraft / act / pickCard / fetchFormats / fetchSources / saveDeck, ApiError
├── domain/formats.js          # default format list, seat names, picks per format
├── domain/describeEvent.js    # one sentence per log event
├── domain/winston.js          # when the Pass button is enabled
├── components/StartScreen     # format and card pool choice
├── components/DraftStatus     # status line for each format
├── components/Pack            # clickable card grid (your pack, or the Rochester table)
├── components/WinstonTable    # piles, the pile you look at, take or pass
├── components/DraftLog        # what happened, most recent first
├── components/Picks           # picks so far
├── components/DraftSummary    # end of draft, save deck, new draft
├── components/CardImage       # picture with card-back fallback
└── App.jsx                    # start → drafting → finished
```
