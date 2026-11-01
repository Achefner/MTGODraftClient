const MAX_SINGLE_COLUMN = 6;

const MANA_VALUE_COLUMNS = [
  ...Array.from({ length: MAX_SINGLE_COLUMN + 1 }, (_, value) => ({ key: `mv-${value}`, label: String(value) })),
  { key: `mv-${MAX_SINGLE_COLUMN + 1}+`, label: `${MAX_SINGLE_COLUMN + 1}+` },
];
const UNKNOWN_COLUMN = { key: 'mv-unknown', label: '?' };

/** The column a pick goes to by default: its mana value, 7+ above six, ? when unknown. */
function defaultColumnKey(card) {
  const value = card.manaValue;
  if (value === null || value === undefined) return UNKNOWN_COLUMN.key;
  return value > MAX_SINGLE_COLUMN ? `mv-${MAX_SINGLE_COLUMN + 1}+` : `mv-${value}`;
}

/**
 * The picks laid out in columns, as Magic Online's deck view: one per mana value from 0 to 6,
 * one for 7 and more, and one for unknown values when needed. A layout `{ columnKey: [pickIndex…] }`
 * (pick indexes in pick order, from the player's drags) says where picks go and in which order;
 * picks it does not place (new ones) go to the end of their mana value column. Each column is
 * `{ key, label, picks: [{ card, index }] }`.
 */
export function arrangePicks(picks, layout = {}) {
  const columns = [...MANA_VALUE_COLUMNS, UNKNOWN_COLUMN].map((column) => ({ ...column, picks: [] }));
  const byKey = new Map(columns.map((column) => [column.key, column]));
  const placed = new Set();

  for (const column of columns) {
    for (const index of layout[column.key] ?? []) {
      if (!Number.isInteger(index) || index < 0 || index >= picks.length || placed.has(index)) continue;
      column.picks.push({ card: picks[index], index });
      placed.add(index);
    }
  }
  picks.forEach((card, index) => {
    if (!placed.has(index)) byKey.get(defaultColumnKey(card)).picks.push({ card, index });
  });

  const unknown = byKey.get(UNKNOWN_COLUMN.key);
  return unknown.picks.length > 0 ? columns : columns.filter((column) => column !== unknown);
}

/**
 * The layout after dragging pick `index` into column `toKey`: above the pick `beforeIndex` when
 * given (dropped onto a card), else at the end of the column.
 */
export function movePick(columns, index, toKey, beforeIndex = null) {
  const layoutOf = (keep) => Object.fromEntries(columns.map((column) => [column.key, column.picks.map((p) => p.index).filter(keep)]));
  if (beforeIndex === index) return layoutOf(() => true);

  const layout = layoutOf((pick) => pick !== index);
  const target = layout[toKey] ?? [];
  layout[toKey] = target;
  const at = beforeIndex === null ? -1 : target.indexOf(beforeIndex);
  if (at < 0) target.push(index);
  else target.splice(at, 0, index);
  return layout;
}
