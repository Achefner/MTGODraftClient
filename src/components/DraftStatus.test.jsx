import { render, screen } from '@testing-library/react';
import DraftStatus from './DraftStatus';

describe('DraftStatus', () => {
  it('Classic: pack, pick and direction', () => {
    render(<DraftStatus draft={{ format: 'CLASSIC', seat: 0, round: 2, pickNumber: 7, direction: 'RIGHT' }} />);
    expect(screen.getByText('Pack 2 of 3')).toBeInTheDocument();
    expect(screen.getByText('Pick 7 of 15')).toBeInTheDocument();
    expect(screen.getByText(/passing right/i)).toBeInTheDocument();
  });

  it('Rochester: round, booster, pick, direction and whose turn it is', () => {
    render(<DraftStatus draft={{ format: 'ROCHESTER', seat: 0, round: 1, packNumber: 3, opener: 2, pickNumber: 5, direction: 'LEFT', activeSeat: 0, yourTurn: true }} />);
    expect(screen.getByText('Round 1 of 3')).toBeInTheDocument();
    expect(screen.getByText('Booster 3 of 8, opened by Seat 2')).toBeInTheDocument();
    expect(screen.getByText('Pick 5 of 15')).toBeInTheDocument();
    expect(screen.getByText(/passing left/i)).toBeInTheDocument();
    expect(screen.getByText('Your turn')).toBeInTheDocument();
  });

  it('Rochester: names the seat that has to pick', () => {
    render(<DraftStatus draft={{ format: 'ROCHESTER', seat: 0, round: 1, packNumber: 1, opener: 0, pickNumber: 2, direction: 'LEFT', activeSeat: 1, yourTurn: false }} />);
    expect(screen.getByText('Booster 1 of 8, opened by You')).toBeInTheDocument();
    expect(screen.getByText("Seat 1's turn")).toBeInTheDocument();
  });

  it('Winston: stack size and turn', () => {
    render(<DraftStatus draft={{ format: 'WINSTON', seat: 0, yourTurn: false, winston: { pileSizes: [1, 2, 1], currentPile: 0, stackSize: 40 } }} />);
    expect(screen.getByText('40 cards in the stack')).toBeInTheDocument();
    expect(screen.getByText("Opponent's turn")).toBeInTheDocument();
  });
});
