// TODO: Add unit test coverage (see audit E-11)
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
}

export const useInfiniteScroll = (
  callback: () => void,
  options: UseInfiniteScrollOptions = {}
) => {
  const { threshold = 1.0, rootMargin = '100px' } = options;
  const [isFetching, setIsFetching] = useState(false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const isFetchingRef = useRef(isFetching);

  // Keep ref in sync with state to avoid stale closures in observer callback
  useEffect(() => {
    isFetchingRef.current = isFetching;
  }, [isFetching]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target?.isIntersecting && !isFetchingRef.current) {
        setIsFetching(true);
        callback();
      }
    },
    [callback]
  );

  useEffect(() => {
    if (!targetElement) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold,
      rootMargin,
    });

    observer.observe(targetElement);

    return () => {
      if (targetElement) {
        observer.unobserve(targetElement);
      }
    };
  }, [targetElement, handleObserver, threshold, rootMargin]);

  const setTarget = useCallback((element: HTMLElement | null) => {
    setTargetElement(element);
  }, []);

  const resetFetching = useCallback(() => {
    setIsFetching(false);
  }, []);

  return { isFetching, setTarget, resetFetching };
};