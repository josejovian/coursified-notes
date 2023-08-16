import { useCallback, useContext } from "react";
import { ToastType } from "../type";
import { ToastContext } from "../contexts/ContextWrapper";

export function useToast() {
  const setToasts = useContext(ToastContext);

  const addToast = useCallback(
    (toast: ToastType) => {
      console.log(setToasts);
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

  return addToast;
}
