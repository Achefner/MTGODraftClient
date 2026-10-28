# MTGODraftClient

Front end of a simulated booster draft: you sit at seat 0 of an 8-player table, the seven
other seats are bots picking at random. Talks to [MTGODraftService](../MTGODraftService)
on port 8082, which draws the cards from MTGODatabase.

- **Start screen**: pick the card pool, random cards or any CUBE collection with at least
  360 cards, then start.
- **Drafting**: the pack in front of you is shown as card pictures (card back with the name
  when there is no picture). Click a card to pick it; the status line shows pack, pick and
  pass direction; your picks are listed on the side.
- **End**: after 45 picks the summary shows your picks; save them as a DECK collection in
  the card database under a name, or start a new draft.

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
├── api/draftApi.js            # startDraft / getDraft / pickCard / fetchSources / saveDeck, ApiError
├── components/StartScreen     # card pool choice
├── components/DraftStatus     # pack / pick / direction line
├── components/Pack            # clickable card grid
├── components/Picks           # picks so far
├── components/DraftSummary    # end of draft, save deck, new draft
├── components/CardImage       # picture with card-back fallback
└── App.jsx                    # start → drafting → finished
```
