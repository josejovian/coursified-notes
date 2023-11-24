import { TOAST_COLOR_CLASS, TOAST_VARIANT_CLASS } from "@/style";
import { ToastActionType, ToastType } from "@/type";
import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { BsX } from "react-icons/bs";
import { Icon } from "./Icon";
import { TOAST_PHRASE } from "@/consts";

interface ToastProps {
  toast: ToastActionType;
  handleDeleteToast: () => void;
  noBottomGap?: boolean;
}

export function Toast(props: ToastProps) {
  const toastRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();

  const propsWithVariant: ToastProps = useMemo(() => {
    const phraseProps = props.toast.phrase
      ? TOAST_PHRASE[props.toast.phrase]
      : {};

    const variant = props.toast.variant || phraseProps.variant;

    const variantProps = variant ? TOAST_VARIANT_CLASS[variant] : {};

    return {
      ...props,
      toast: {
        ...props.toast,
        ...variantProps,
        ...phraseProps,
      },
    };
  }, [props]);

  const { toast, handleDeleteToast } = propsWithVariant;

  const { icon, message, color = "secondary", dead, standby } = toast;

  const renderToast = useMemo(
    () => (
      <div
        className={clsx(
          "flex items-center gap-4 pl-5 pr-3 py-3",
          "shadow-md text-white",
          TOAST_COLOR_CLASS[color]
        )}
        style={
          {
            // height: dead ? "0px!important" : "max-content",
          }
        }
      >
        {icon && <Icon size="m" IconComponent={icon} />}
        <div className="flex flex-col">
          <span>{message}</span>
        </div>
        <div
          role="button"
          tabIndex={0}
          className="Icon-xl hover:opacity-50 active:opacity-25 transition-opacity cursor-pointer"
          onClick={handleDeleteToast}
        >
          <BsX />
        </div>
      </div>
    ),
    [color, handleDeleteToast, icon, message]
  );

  useEffect(() => {
    if (height === undefined && toastRef.current && standby) {
      setHeight(toastRef.current.offsetHeight);
    }
  }, [height, standby]);

  return (
    <div
      ref={toastRef}
      className={clsx(
        // "duration-1000",
        dead || !standby ? "scale-0" : "scale-100",
        // standby ? "scale-100" : "scale-0",
        "!w-fit transition-all"
      )}
      style={{
        height: dead ? "0px" : `${height}px`,
        marginTop: dead ? "0px" : "16px",
        // animation: dead ? "toastDecay pad 0.3s linear" : "",
        // animationName: dead ? "toastDecay" : "",
        // transition: "width 2s, height 4s",
      }}
    >
      {renderToast}
    </div>
  );
}
