import { Dispatch, ReactNode, SetStateAction, createContext } from "react";
import { ScreenSizeType, ToastType } from "@/src/type";

const SCREEN_CONTEXT_DEFAULT: ScreenSizeType = {
  width: 0,
  size: "xs",
};

export const ScreenContext = createContext(SCREEN_CONTEXT_DEFAULT);

export const ToastContext = createContext<
  Dispatch<SetStateAction<ToastType[]>>
>(() => {});

interface ContextWrapperProps {
  children: ReactNode;
  screen: ScreenSizeType;
  setToasts: Dispatch<SetStateAction<ToastType[]>>;
}

export function ContextWrapper({
  children,
  screen,
  setToasts,
}: ContextWrapperProps) {
  return (
    <ToastContext.Provider value={setToasts}>
      <ScreenContext.Provider value={screen}>{children}</ScreenContext.Provider>
    </ToastContext.Provider>
  );
}
