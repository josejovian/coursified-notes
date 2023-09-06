import { useCallback, useContext, useMemo } from "react";
import { ToastType } from "../type";
import { ToastContext } from "../contexts/ContextWrapper";

export function useToast() {
  const setToasts = useContext(ToastContext);

  const addToast = useCallback(
    (toast: ToastType) => {
      setToasts(
        (prev: ToastType[]) =>
          [
            ...prev,
            {
              ...toast,
              id: `${new Date().toISOString()}`,
            },
          ] as ToastType[]
      );
    },
    [setToasts]
  );

  return useMemo(
    () => ({
      addToast,
    }),
    [addToast]
  );
}
