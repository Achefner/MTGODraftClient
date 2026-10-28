import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StartScreen from './StartScreen';

const sources = [{ id: 'c1', name: 'Power LSV Cube', cardCount: 540 }, { id: 'c2', name: 'Tiny Cube', cardCount: 40 }];

describe('StartScreen', () => {
  it('starts a random draft by default', async () => {
    const onStart = jest.fn();
    render(<StartScreen sources={sources} onStart={onStart} />);
    await userEvent.click(screen.getByRole('button', { name: /start draft/i }));
    expect(onStart).toHaveBeenCalledWith({ source: 'random' });
  });

  it('lists the cubes with their size and starts a cube draft when one is chosen', async () => {
    const onStart = jest.fn();
    render(<StartScreen sources={sources} onStart={onStart} />);
    const select = screen.getByRole('combobox', { name: /card pool/i });
    expect(screen.getByRole('option', { name: /power lsv cube \(540 cards\)/i })).toBeInTheDocument();
    await userEvent.selectOptions(select, 'c1');
    await userEvent.click(screen.getByRole('button', { name: /start draft/i }));
    expect(onStart).toHaveBeenCalledWith({ source: 'cube', collectionId: 'c1' });
  });

  it('disables cubes that are too small for a draft', () => {
    render(<StartScreen sources={sources} onStart={jest.fn()} />);
    expect(screen.getByRole('option', { name: /tiny cube/i })).toBeDisabled();
  });

  it('works with no cubes at all', async () => {
    const onStart = jest.fn();
    render(<StartScreen sources={[]} onStart={onStart} />);
    await userEvent.click(screen.getByRole('button', { name: /start draft/i }));
    expect(onStart).toHaveBeenCalledWith({ source: 'random' });
  });

  it('disables the button while starting', () => {
    render(<StartScreen sources={[]} onStart={jest.fn()} disabled />);
    expect(screen.getByRole('button', { name: /start draft/i })).toBeDisabled();
  });
});
