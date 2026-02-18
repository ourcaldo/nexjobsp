import { renderHook, act } from '@testing-library/react';
import { useSearchHistory } from '../useSearchHistory';

const STORAGE_KEY = 'job_search_history';

// localStorage mock is already provided by jsdom, but let's ensure it's clean
beforeEach(() => {
  localStorage.clear();
});

describe('useSearchHistory', () => {
  it('returns empty history on first render', () => {
    const { result } = renderHook(() => useSearchHistory());
    expect(result.current.history).toEqual([]);
  });

  it('loads existing history from localStorage', () => {
    const existing = [
      { query: 'React developer', timestamp: Date.now() },
      { query: 'Frontend', timestamp: Date.now() - 1000 },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

    const { result } = renderHook(() => useSearchHistory());
    expect(result.current.history).toEqual(['React developer', 'Frontend']);
  });

  it('addToHistory adds a query and persists it', () => {
    const { result } = renderHook(() => useSearchHistory());

    act(() => {
      result.current.addToHistory('Software Engineer');
    });

    expect(result.current.history).toContain('Software Engineer');

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    expect(stored[0].query).toBe('Software Engineer');
  });

  it('addToHistory deduplicates case-insensitively', () => {
    const { result } = renderHook(() => useSearchHistory());

    act(() => {
      result.current.addToHistory('react');
    });
    act(() => {
      result.current.addToHistory('React');
    });

    expect(result.current.history).toEqual(['React']);
  });

  it('addToHistory limits to 5 items', () => {
    const { result } = renderHook(() => useSearchHistory());

    act(() => {
      for (let i = 1; i <= 7; i++) {
        result.current.addToHistory(`Query ${i}`);
      }
    });

    expect(result.current.history).toHaveLength(5);
    // Most recent first
    expect(result.current.history[0]).toBe('Query 7');
  });

  it('addToHistory moves existing query to front', () => {
    const { result } = renderHook(() => useSearchHistory());

    act(() => {
      result.current.addToHistory('First');
      result.current.addToHistory('Second');
      result.current.addToHistory('Third');
    });

    act(() => {
      result.current.addToHistory('First');
    });

    expect(result.current.history[0]).toBe('First');
    expect(result.current.history).toHaveLength(3);
  });

  it('addToHistory ignores empty/whitespace queries', () => {
    const { result } = renderHook(() => useSearchHistory());

    act(() => {
      result.current.addToHistory('');
      result.current.addToHistory('   ');
    });

    expect(result.current.history).toEqual([]);
  });

  it('addToHistory trims whitespace', () => {
    const { result } = renderHook(() => useSearchHistory());

    act(() => {
      result.current.addToHistory('  trimmed  ');
    });

    expect(result.current.history[0]).toBe('trimmed');
  });

  it('clearHistory removes all items', () => {
    const { result } = renderHook(() => useSearchHistory());

    act(() => {
      result.current.addToHistory('Query 1');
      result.current.addToHistory('Query 2');
    });

    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.history).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('removeFromHistory removes a specific query', () => {
    const { result } = renderHook(() => useSearchHistory());

    act(() => {
      result.current.addToHistory('Keep');
      result.current.addToHistory('Remove');
    });

    act(() => {
      result.current.removeFromHistory('Remove');
    });

    expect(result.current.history).toEqual(['Keep']);
  });

  it('removeFromHistory does nothing for non-existent query', () => {
    const { result } = renderHook(() => useSearchHistory());

    act(() => {
      result.current.addToHistory('Existing');
    });

    act(() => {
      result.current.removeFromHistory('NonExistent');
    });

    expect(result.current.history).toEqual(['Existing']);
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem(STORAGE_KEY, 'not valid json');

    const { result } = renderHook(() => useSearchHistory());
    expect(result.current.history).toEqual([]);
  });
});
