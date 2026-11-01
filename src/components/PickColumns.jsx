import { useState } from 'react';
import CardImage from './CardImage';
import { arrangePicks, movePick } from '../domain/pickLayout';

/**
 * Picks laid out in columns (by mana value unless the player moved them), each column a stack of
 * overlapping cards showing their title bar; hovering one zooms it. With `onMove`, cards can be
 * dragged to another column (dropped on a column: at its end; on a card: above it), and `onMove`
 * receives the new layout. `total` is left out when the format has none.
 */
export default function PickColumns({ picks, total, title = 'Your picks', layout, onMove }) {
  const [dragging, setDragging] = useState(null);
  const [over, setOver] = useState(null);
  const columns = arrangePicks(picks, layout);
  const heading = `${title} (${total === undefined ? picks.length : `${picks.length}/${total}`})`;

  const reset = () => {
    setDragging(null);
    setOver(null);
  };

  const drop = (event, columnKey, beforeIndex = null) => {
    event.preventDefault();
    event.stopPropagation();
    if (dragging !== null) onMove(movePick(columns, dragging, columnKey, beforeIndex));
    reset();
  };

  const startDrag = (event, index) => {
    event.dataTransfer?.setData?.('text/plain', String(index)); // Firefox only starts a drag with data
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
    setDragging(index);
  };

  const allowDrop = (event, columnKey) => {
    if (dragging === null) return;
    event.preventDefault();
    if (over !== columnKey) setOver(columnKey);
  };

  return (
    <section className="pick-columns" aria-label={heading}>
      <h2>{heading}</h2>
      {picks.length === 0 ? (
        <p className="pick-columns__empty">No picks yet.</p>
      ) : (
        <div className="pick-columns__row">
          {columns.map((column) => (
            <section
              key={column.key}
              className={`pick-column${over === column.key ? ' pick-column--over' : ''}`}
              aria-label={`Mana value ${column.label}`}
              onDragOver={onMove ? (event) => allowDrop(event, column.key) : undefined}
              onDrop={onMove ? (event) => drop(event, column.key) : undefined}
            >
              <h3>{column.label} <span className="pick-column__count">({column.picks.length})</span></h3>
              <ul>
                {column.picks.map(({ card, index }) => (
                  <li
                    key={index}
                    title={card.name}
                    className={dragging === index ? 'pick-column__card--dragging' : undefined}
                    draggable={onMove ? 'true' : undefined}
                    onDragStart={onMove ? (event) => startDrag(event, index) : undefined}
                    onDragEnd={onMove ? reset : undefined}
                    onDrop={onMove ? (event) => drop(event, column.key, index) : undefined}
                  >
                    <CardImage card={card} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
