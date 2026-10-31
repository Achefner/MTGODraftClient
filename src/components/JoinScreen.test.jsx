import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JoinScreen from './JoinScreen';

const preview = (overrides = {}) => ({
  id: 'd1', format: 'ROCHESTER', source: 'cube:c1', status: 'LOBBY', timed: true,
  seats: [
    { seat: 0, you: false, name: 'Amir', kind: 'HUMAN', connected: true, pickCount: 0 },
    { seat: 1, you: false, name: null, kind: 'OPEN', connected: false, pickCount: 0 },
    { seat: 2, you: false, name: null, kind: 'OPEN', connected: false, pickCount: 0 },
  ],
  ...overrides,
});

describe('JoinScreen', () => {
  it('describes the table and joins it under a name', async () => {
    const onJoin = jest.fn();
    render(<JoinScreen preview={preview()} onJoin={onJoin} onCancel={jest.fn()} />);

    expect(screen.getByRole('heading', { name: /join amir's rochester draft/i })).toBeInTheDocument();
    expect(screen.getByText(/2 open seats/i)).toBeInTheDocument();
    expect(screen.getByText(/pick timer on/i)).toBeInTheDocument();

    await userEvent.type(screen.getByRole('textbox', { name: /your name/i }), 'Guest');
    await userEvent.click(screen.getByRole('button', { name: /join/i }));
    expect(onJoin).toHaveBeenCalledWith('Guest');
  });

  it('says when the table cannot be joined any more', async () => {
    const onCancel = jest.fn();
    render(<JoinScreen preview={preview({ status: 'RUNNING' })} onJoin={jest.fn()} onCancel={onCancel} />);

    expect(screen.getByText(/already started/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^join/i })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /start your own draft/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('says when the table is full', () => {
    render(<JoinScreen preview={preview({ seats: [preview().seats[0]] })} onJoin={jest.fn()} onCancel={jest.fn()} />);
    expect(screen.getByText(/table is full/i)).toBeInTheDocument();
  });

  it('waits for the table while it loads', () => {
    render(<JoinScreen preview={null} onJoin={jest.fn()} onCancel={jest.fn()} />);
    expect(screen.getByText(/loading the table/i)).toBeInTheDocument();
  });
});
