# CLAUDE.md

React front end of the draft simulator. Talks only to `../MTGODraftService` (:8082). Same
toolchain and conventions as `../MTGOEnchantWordle` (Vite + React 19, Jest + Testing Library,
Babel for Jest so no `import.meta.env`; `npm install --legacy-peer-deps`).

```bash
npm run dev     # :5174
npm test        # tests live next to the code as *.test.js(x); App.test.jsx mocks ./api/draftApi
```

- All draft rules live in the service; the client only renders the draft view it receives and
  never computes picks or passing. `ROUNDS` / `PACK_SIZE` in `DraftStatus.jsx` and
  `CARDS_NEEDED` in `StartScreen.jsx` are display constants mirroring the service.
- `ApiError` carries the service's `{"error": …}` message so the UI can show it verbatim.
- Card pictures come straight from the draft view (`imageUrl`, Scryfall large images);
  `CardImage` falls back to `public/card-back.svg` with the name overlaid.
