import { render, screen } from '@testing-library/react';
import ConnectionStatus from './ConnectionStatus';

describe('ConnectionStatus', () => {
  it('says nothing while connected', () => {
    const { container } = render(<ConnectionStatus status="connected" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('tells the player it is reconnecting', () => {
    render(<ConnectionStatus status="reconnecting" />);
    expect(screen.getByRole('status')).toHaveTextContent(/connection lost, reconnecting/i);
  });

  it('tells the player when it gave up', () => {
    render(<ConnectionStatus status="closed" />);
    expect(screen.getByRole('status')).toHaveTextContent(/disconnected, reload the page/i);
  });
});
