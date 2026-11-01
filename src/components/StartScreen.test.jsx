import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StartScreen from './StartScreen';
import { DEFAULT_FORMATS } from '../domain/formats';

const sources = [{ id: 'c1', name: 'Power LSV Cube', cardCount: 540 }, { id: 'c2', name: 'Tiny Cube', cardCount: 100 }];
const renderStart = (props = {}) => {
  const onStart = jest.fn();
  render(<StartScreen formats={DEFAULT_FORMATS} sources={sources} onStart={onStart} {...props} />);
  return onStart;
};
const start = () => userEvent.click(screen.getByRole('button', { name: /draft against bots/i }));
const SOLO = { playerName: '', timed: true, startNow: true };

describe('StartScreen', () => {
  it('lists the Power LSV Cube first and selects it, random cards last', async () => {
    const onStart = renderStart({ sources: [{ id: 'c2', name: 'Arena Cube', cardCount: 450 }, ...sources] });
    const options = screen.getAllByRole('option').filter((o) => o.closest('select').id === 'source-select');
    expect(options.map((o) => o.textContent)).toEqual([
      'Power LSV Cube (540 cards)', 'Arena Cube (450 cards)', 'Tiny Cube (100 cards, needs 360)', 'Random cards from the database',
    ]);
    expect(screen.getByRole('combobox', { name: /card pool/i })).toHaveValue('c1');

    await start();

    expect(onStart).toHaveBeenCalledWith({ source: 'cube', collectionId: 'c1', format: 'CLASSIC', ...SOLO });
  });

  it('can still draft random cards', async () => {
    const onStart = renderStart();
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /card pool/i }), 'random');
    await start();
    expect(onStart).toHaveBeenCalledWith({ source: 'random', format: 'CLASSIC', ...SOLO });
  });

  it('offers every format and describes the chosen one', async () => {
    renderStart();
    const select = screen.getByRole('combobox', { name: /format/i });
    expect(screen.getAllByRole('option', { name: /classic|rochester|winston/i })).toHaveLength(3);
    expect(screen.getByText(/left, then right, then left/i)).toBeInTheDocument();

    await userEvent.selectOptions(select, 'WINSTON');

    expect(screen.getByText(/3 face-down piles/i)).toBeInTheDocument();
  });

  it('starts a cube draft in the chosen format', async () => {
    const onStart = renderStart();
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /format/i }), 'ROCHESTER');
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /card pool/i }), 'c1');
    await start();
    expect(onStart).toHaveBeenCalledWith({ source: 'cube', collectionId: 'c1', format: 'ROCHESTER', ...SOLO });
  });

  it('disables cubes too small for the chosen format', async () => {
    renderStart();
    expect(screen.getByRole('option', { name: /tiny cube \(100 cards, needs 360\)/i })).toBeDisabled();

    await userEvent.selectOptions(screen.getByRole('combobox', { name: /format/i }), 'WINSTON');

    expect(screen.getByRole('option', { name: /tiny cube \(100 cards\)/i })).toBeEnabled();
  });

  it('falls back to the first cube that fits when the chosen one is too small for a new format', async () => {
    const onStart = renderStart();
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /format/i }), 'WINSTON');
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /card pool/i }), 'c2');
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /format/i }), 'CLASSIC');
    await start();
    expect(onStart).toHaveBeenCalledWith({ source: 'cube', collectionId: 'c1', format: 'CLASSIC', ...SOLO });
  });

  it('works with no cubes at all', async () => {
    const onStart = renderStart({ sources: [] });
    await start();
    expect(onStart).toHaveBeenCalledWith({ source: 'random', format: 'CLASSIC', ...SOLO });
  });

  it('opens a table for friends, with the name and without the timer', async () => {
    const onStart = renderStart();
    await userEvent.type(screen.getByRole('textbox', { name: /your name/i }), 'Amir');
    await userEvent.click(screen.getByRole('checkbox', { name: /pick timer/i }));
    await userEvent.click(screen.getByRole('button', { name: /open a table/i }));
    expect(onStart).toHaveBeenCalledWith({ source: 'cube', collectionId: 'c1', format: 'CLASSIC', playerName: 'Amir', timed: false, startNow: false });
  });

  it('disables the controls while starting', () => {
    renderStart({ disabled: true });
    expect(screen.getByRole('button', { name: /draft against bots/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /open a table/i })).toBeDisabled();
    expect(screen.getByRole('combobox', { name: /format/i })).toBeDisabled();
  });
});
