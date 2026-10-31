import { openStream } from './draftStream';

class FakeEventSource {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 2;

  constructor(url) {
    this.url = url;
    this.readyState = FakeEventSource.CONNECTING;
    this.listeners = {};
    this.closed = false;
    FakeEventSource.last = this;
  }

  addEventListener(type, listener) {
    (this.listeners[type] ??= []).push(listener);
  }

  emit(type, event = {}) {
    (this.listeners[type] ?? []).forEach((listener) => listener(event));
  }

  close() {
    this.closed = true;
    this.readyState = FakeEventSource.CLOSED;
  }
}

describe('openStream', () => {
  it('passes the updates on and reports the connection state', () => {
    const onUpdate = jest.fn();
    const onStatus = jest.fn();
    const close = openStream('http://api/stream', { onUpdate, onStatus }, FakeEventSource);
    const source = FakeEventSource.last;
    expect(source.url).toBe('http://api/stream');

    source.emit('open');
    expect(onStatus).toHaveBeenLastCalledWith('connected');

    source.emit('update', { data: JSON.stringify({ version: 3, view: { id: 'd1' } }) });
    expect(onUpdate).toHaveBeenCalledWith({ version: 3, view: { id: 'd1' } });

    source.readyState = FakeEventSource.CONNECTING;
    source.emit('error');
    expect(onStatus).toHaveBeenLastCalledWith('reconnecting');

    source.readyState = FakeEventSource.CLOSED;
    source.emit('error');
    expect(onStatus).toHaveBeenLastCalledWith('closed');

    close();
    expect(source.closed).toBe(true);
  });

  it('ignores an update it cannot read', () => {
    const onUpdate = jest.fn();
    openStream('u', { onUpdate, onStatus: jest.fn() }, FakeEventSource);
    FakeEventSource.last.emit('update', { data: 'not json' });
    expect(onUpdate).not.toHaveBeenCalled();
  });
});
