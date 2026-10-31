import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Lobby from './Lobby';

const view = (overrides = {}) => ({
  id: 'd1', format: 'CLASSIC', status: 'LOBBY', seat: 0, host: true,
  seats: [
    { seat: 0, you: true, name: 'Amir', kind: 'HUMAN', connected: true, pickCount: 0 },
    { seat: 1, you: false, name: 'Guest', kind: 'HUMAN', connected: false, pickCount: 0 },
    { seat: 2, you: false, name: null, kind: 'OPEN', connected: false, pickCount: 0 },
  ],
  ...overrides,
});

describe('Lobby', () => {
  it('shows the link to share and who sits where', () => {
    render(<Lobby view={view()} link="http://localhost:5174/?join=d1" onStart={jest.fn()} onLeave={jest.fn()} />);

    expect(screen.getByRole('textbox', { name: /invite link/i })).toHaveValue('http://localhost:5174/?join=d1');
    const seats = within(screen.getByRole('list', { name: /seats/i })).getAllByRole('listitem');
    expect(seats[0]).toHaveTextContent('Amir (you)');
    expect(seats[1]).toHaveTextContent('Guest');
    expect(seats[1]).toHaveTextContent(/offline/i);
    expect(seats[2]).toHaveTextContent(/open seat/i);
    expect(screen.getByText(/open seats will be played by bots/i)).toBeInTheDocument();
  });

  it('lets the host start', async () => {
    const onStart = jest.fn();
    render(<Lobby view={view()} link="l" onStart={onStart} onLeave={jest.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /start the draft/i }));
    expect(onStart).toHaveBeenCalled();
  });

  it('makes the others wait for the host', async () => {
    const onLeave = jest.fn();
    render(<Lobby view={view({ seat: 1, host: false })} link="l" onStart={jest.fn()} onLeave={onLeave} />);
    expect(screen.queryByRole('button', { name: /start the draft/i })).not.toBeInTheDocument();
    expect(screen.getByText(/waiting for amir to start/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /leave/i }));
    expect(onLeave).toHaveBeenCalled();
  });

  it('copies the link', async () => {
    const writeText = jest.fn().mockResolvedValue();
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    render(<Lobby view={view()} link="http://x/?join=d1" onStart={jest.fn()} onLeave={jest.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /copy/i }));
    expect(writeText).toHaveBeenCalledWith('http://x/?join=d1');
    expect(await screen.findByRole('button', { name: /copied/i })).toBeInTheDocument();
  });

  it('leaves the field to copy by hand when the clipboard is refused', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: jest.fn().mockRejectedValue(new Error('denied')) }, configurable: true });
    render(<Lobby view={view()} link="l" onStart={jest.fn()} onLeave={jest.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /copy/i }));
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
  });
});
