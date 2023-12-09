// https://gist.github.com/mudge/eb9178a4b6d595ffde8f9cb31744afcf

import { useRef, useCallback } from "react";

export const useDebounce = () => {
  const timeout = useRef();

  return useCallback((func, wait = 100) => {
    const later = () => {
      clearTimeout(timeout.current);
      func();
    };

    clearTimeout(timeout.current);
    timeout.current = setTimeout(later, wait);
  }, []);
};
