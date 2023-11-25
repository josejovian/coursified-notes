import { useCallback, useContext, useMemo } from "react";
import { ToastContext } from "../contexts";
import { ToastType } from "../type";

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
