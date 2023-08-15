import { Toast } from "@/src/components";
import { ScreenSizeCategory, ScreenSizeType, ToastType } from "@/src/type";
import { ToastContext } from "@/src/utils";
import { render } from "katex";
import type { AppProps } from "next/app";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "../styles/globals.css";
import { ContextWrapper } from "@/src/contexts";

export default function App({ Component, pageProps }: AppProps) {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const [screen, setScreen] = useState<ScreenSizeType>({
    width: 0,
    size: "xs",
  });

  const initialize = useRef(false);

  const handleProcessNewToast = useCallback(() => {
    const toast = toasts.at(-1);
    if (toast && !toast.dead) {
      const { id, duration = 10 } = toast;
      setTimeout(() => {
        setToasts((prev: ToastType[]) =>
          prev.map((x) =>
            x.id === id
              ? {
                  ...x,
                  dead: true,
                }
              : x
          )
        );
      }, duration * 1000);
    }
  }, [toasts]);

  const renderToasts = useMemo(() => {
    return (
      <div className="fixed bottom-16 right-16 z-50 flex flex-col-reverse gap-4">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            // title={toast.id}
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
        setTimeout(() => {
          setToasts((prev: ToastType[]) =>
            prev.filter((x) => x.id !== toast.id)
          );
        }, 800);
      }
    });
  }, [toasts]);

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
