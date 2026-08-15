'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Trả về giá trị sau khi user ngừng thay đổi trong `delayMs`.
 * @template T
 * @param {T} value
 * @param {number} [delayMs=400]
 * @returns {T}
 */
export function useDebounce(value, delayMs = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timerId = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timerId);
  }, [value, delayMs]);

  return debounced;
}

/**
 * Debounce gọi callback — dùng cho search inline (VD: VoucherScopeItemList).
 * @param {(...args: unknown[]) => void} callback
 * @param {number} [delayMs=400]
 * @returns {{ run: (...args: unknown[]) => void, cancel: () => void }}
 */
export function useDebouncedCallback(callback, delayMs = 400) {
  const callbackRef = useRef(callback);
  const timerRef = useRef(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const run = useCallback((...args) => {
    cancel();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      callbackRef.current(...args);
    }, delayMs);
  }, [cancel, delayMs]);

  return { run, cancel };
}
