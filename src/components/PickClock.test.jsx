import { act, render, screen } from '@testing-library/react';
import PickClock from './PickClock';

describe('PickClock', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-11-01T10:00:00Z'));
  });
  afterEach(() => jest.useRealTimers());

  it('counts down from the time left when the view arrived', () => {
    render(<PickClock timer={{ seconds: 75, remainingMillis: 42_000 }} receivedAt={Date.now()} />);
    expect(screen.getByRole('timer')).toHaveTextContent('0:42');

    act(() => { jest.advanceTimersByTime(2_000); });
    expect(screen.getByRole('timer')).toHaveTextContent('0:40');
  });

  it('warns in the last ten seconds and stops at zero', () => {
    render(<PickClock timer={{ seconds: 20, remainingMillis: 11_000 }} receivedAt={Date.now()} />);
    expect(screen.getByRole('timer')).not.toHaveClass('pick-clock--urgent');

    act(() => { jest.advanceTimersByTime(2_000); });
    expect(screen.getByRole('timer')).toHaveClass('pick-clock--urgent');

    act(() => { jest.advanceTimersByTime(20_000); });
    expect(screen.getByRole('timer')).toHaveTextContent('0:00');
  });

  it('shows minutes', () => {
    render(<PickClock timer={{ seconds: 75, remainingMillis: 75_000 }} receivedAt={Date.now()} />);
    expect(screen.getByRole('timer')).toHaveTextContent('1:15');
  });
});
