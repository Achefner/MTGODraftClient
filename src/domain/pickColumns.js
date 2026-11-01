const MAX_SINGLE_COLUMN = 6;

/**
 * The picks grouped by mana value, as Magic Online's deck view does: one column per value from
 * 0 to 6, one for 7 and more, and one for unknown values when there are any. Cards keep the order
 * they were picked in. Columns are plain data so they can later be rearranged by dragging.
 */
export function pickColumns(picks) {
  const columns = [];
  for (let value = 0; value <= MAX_SINGLE_COLUMN; value++) columns.push({ key: `mv-${value}`, label: String(value), cards: [] });
  const high = { key: `mv-${MAX_SINGLE_COLUMN + 1}+`, label: `${MAX_SINGLE_COLUMN + 1}+`, cards: [] };
  const unknown = { key: 'mv-unknown', label: '?', cards: [] };
  columns.push(high);

  for (const card of picks) {
    const value = card.manaValue;
    if (value === null || value === undefined) unknown.cards.push(card);
    else if (value > MAX_SINGLE_COLUMN) high.cards.push(card);
    else columns[value].cards.push(card);
  }
  if (unknown.cards.length > 0) columns.push(unknown);
  return columns;
}
