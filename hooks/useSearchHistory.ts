// TODO: Add unit test coverage (see audit E-11)
import { useState, useEffect } from 'react';

const SEARCH_HISTORY_KEY = 'job_search_history';
const MAX_HISTORY_ITEMS = 5;

interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

export const useSearchHistory = () => {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        const items: SearchHistoryItem[] = JSON.parse(stored);
        const queries = items.map(item => item.query);
        setHistory(queries);
      }
    } catch (error) {
      setHistory([]);
    }
  };

  const addToHistory = (query: string) => {
    if (!query.trim()) return;

    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      let items: SearchHistoryItem[] = stored ? JSON.parse(stored) : [];

      items = items.filter(item => item.query.toLowerCase() !== query.toLowerCase());
      
      items.unshift({
        query: query.trim(),
        timestamp: Date.now()
      });

      items = items.slice(0, MAX_HISTORY_ITEMS);

      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(items));
      setHistory(items.map(item => item.query));
    } catch (error) {
      // Silently fail if localStorage is not available
    }
  };

  const clearHistory = () => {
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
      setHistory([]);
    } catch (error) {
      // Silently fail
    }
  };

  const removeFromHistory = (query: string) => {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        let items: SearchHistoryItem[] = JSON.parse(stored);
        items = items.filter(item => item.query !== query);
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(items));
        setHistory(items.map(item => item.query));
      }
    } catch (error) {
      // Silently fail
    }
  };

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory
  };
};
