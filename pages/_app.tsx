import { Toast } from "@/src/components";
import { ToastType } from "@/src/type";
import { ToastContext } from "@/src/utils";
import { render } from "katex";
import type { AppProps } from "next/app";
import { useCallback, useEffect, useMemo, useState } from "react";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  const [toasts, setToasts] = useState<ToastType[]>([]);

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

  return (
    <ToastContext.Provider value={setToasts}>
      {renderToasts}
      <Component {...pageProps} />
    </ToastContext.Provider>
  );
}

export default MyApp;
