import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Toast } from "@/components";
import { ContextWrapper } from "@/contexts";
import { ScreenSizeCategory, ScreenSizeType, ToastActionType } from "@/types";
import { useDebounce } from "@/hooks";

export default function App({ Component, pageProps }: AppProps) {
  const [toasts, setToasts] = useState<ToastActionType[]>([]);
  const [screen, setScreen] = useState<ScreenSizeType>({
    width: 0,
    size: "xs",
  });

  const debounce = useDebounce();
  const initialize = useRef(false);

  const handleProcessNewToast = useCallback(() => {
    const toast = toasts.at(-1);
    if (toast && !toast.standby) {
      const { id } = toast;
      setToasts((prev: ToastActionType[]) =>
        prev.map((x) =>
          x.id === id
            ? {
                ...x,
                standby: true,
              }
            : x
        )
      );
    } else if (toast && !toast.dead) {
      const { id, duration = 10 } = toast;
      debounce(() => {
        setToasts((prev: ToastActionType[]) =>
          prev.map((x) =>
            x.id === id
              ? {
                  ...x,
                  dead: true,
                }
              : x
          )
        );
      }, duration * 1000 + 500);
    }
  }, [debounce, toasts]);

  const renderToasts = useMemo(() => {
    return (
      <div
        className="fixed bottom-16 left-1/2 mx-auto z-50 flex flex-col-reverse items-center justify-center"
        style={{
          transform: "translate(-50%)",
        }}
      >
        {toasts
          // .filter((toast) => !toast.dead)
          .map((toast) => (
            <Toast
              key={toast.id}
              toast={toast}
              handleDeleteToast={() => {
                setToasts((prev) => {
                  return prev.map((x) =>
                    x.id === toast.id
                      ? {
                          ...x,
                          dead: true,
                        }
                      : x
                  );
                });
              }}
            />
          ))}
      </div>
    );
  }, [toasts]);

  const handleProcessDeadToast = useCallback(() => {
    toasts.map((toast) => {
      if (toast && toast.dead) {
        debounce(() => {
          setToasts((prev: ToastActionType[]) =>
            prev.filter((x) => x.id !== toast.id)
          );
        }, 800);
      }
    });
  }, [debounce, toasts]);

  useEffect(() => {
    if (toasts.length > 0) {
      handleProcessNewToast();
      handleProcessDeadToast();
    }
  }, [handleProcessDeadToast, handleProcessNewToast, toasts]);

  const handleUpdateScreen = useCallback(() => {
    const width = window.innerWidth;
    let screenCategory: ScreenSizeCategory = "xs";

    if (width >= 1536) screenCategory = "2xl";
    else if (width >= 1280) screenCategory = "xl";
    else if (width >= 1024) screenCategory = "lg";
    else if (width >= 768) screenCategory = "md";
    else if (width >= 640) screenCategory = "sm";

    setScreen({
      width,
      size: screenCategory,
    });
  }, []);

  const handleInitialize = useCallback(() => {
    if (initialize.current) return;
    window.addEventListener("resize", handleUpdateScreen);

    handleUpdateScreen();
    initialize.current = true;
  }, [handleUpdateScreen]);

  useEffect(() => {
    handleInitialize();
  }, [handleInitialize]);

  return (
    <ContextWrapper screen={screen} setToasts={setToasts}>
      {renderToasts}
      <Component {...pageProps} />
    </ContextWrapper>
  );
}
