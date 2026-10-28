import { render, screen } from '@testing-library/react';
import DraftStatus from './DraftStatus';

describe('DraftStatus', () => {
  it('shows pack, pick and direction', () => {
    render(<DraftStatus draft={{ round: 2, pickNumber: 7, direction: 'RIGHT', pack: Array(9).fill({}), picks: [] }} />);
    expect(screen.getByText('Pack 2 of 3')).toBeInTheDocument();
    expect(screen.getByText('Pick 7 of 15')).toBeInTheDocument();
    expect(screen.getByText(/passing right/i)).toBeInTheDocument();
  });
});
