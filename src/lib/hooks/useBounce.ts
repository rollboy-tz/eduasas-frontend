import { useState, useEffect } from 'react';

/**
 * useDebounce - Hook inayochelewesha update ya value hadi mtumiaji aache kubadilisha input.
 * * * @template T - Aina ya data unayotaka kuipa debounce (string, number, object, etc).
 * @param {T} value - Value inayobadilika (kawaida ni input state).
 * @param {number} delay - Muda wa kusubiri kwa milliseconds (mfano: 300).
 * @returns {T} - Value iliyochelewa (debounced value).
 * * * @example
 * const debouncedSearch = useDebounce(searchTerm, 300);
 */
export const useDebounce = <T>(value: T, delay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Tunatengeneza timer ya kusubiri
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: Ikitokea value imebadilika kabla ya muda kuisha, 
    // tunafuta timer ya zamani ili kuzuia "flickering"
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};