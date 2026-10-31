import { clearSession, joinIdFromUrl, joinLink, loadSession, saveSession } from './session';

const memoryStorage = () => {
  const data = {};
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v); },
    removeItem: (k) => { delete data[k]; },
  };
};

describe('session', () => {
  it('saves, loads and clears the seat of the current draft', () => {
    const storage = memoryStorage();
    expect(loadSession(storage)).toBeNull();

    saveSession({ draftId: 'd1', token: 't1', seat: 2 }, storage);
    expect(loadSession(storage)).toEqual({ draftId: 'd1', token: 't1', seat: 2 });

    clearSession(storage);
    expect(loadSession(storage)).toBeNull();
  });

  it('ignores broken or incomplete stored data', () => {
    const storage = memoryStorage();
    storage.setItem('mtgo-draft-session', 'not json');
    expect(loadSession(storage)).toBeNull();
    storage.setItem('mtgo-draft-session', JSON.stringify({ draftId: 'd1' }));
    expect(loadSession(storage)).toBeNull();
  });

  it('survives a storage that throws (private browsing)', () => {
    const broken = { getItem: () => { throw new Error('no'); }, setItem: () => { throw new Error('no'); }, removeItem: () => { throw new Error('no'); } };
    expect(loadSession(broken)).toBeNull();
    expect(() => saveSession({ draftId: 'd', token: 't', seat: 0 }, broken)).not.toThrow();
    expect(() => clearSession(broken)).not.toThrow();
  });

  it('reads and builds join links', () => {
    expect(joinIdFromUrl('?join=abc-1')).toBe('abc-1');
    expect(joinIdFromUrl('')).toBeNull();
    expect(joinLink('http://localhost:5174', 'abc 1')).toBe('http://localhost:5174/?join=abc%201');
  });
});
