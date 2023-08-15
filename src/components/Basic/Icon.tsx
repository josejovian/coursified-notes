import clsx from "clsx";
import { CSSProperties, HTMLProps, useMemo } from "react";
import { IconType, IconBaseProps as IconLibProps } from "react-icons";
import { MdExpandMore } from "react-icons/md";

interface IconBaseProps {
  IconComponent: IconType;
  size?: "s" | "m" | "l";
}

type IconProps = IconBaseProps & Omit<IconLibProps, keyof IconBaseProps>;

export function Icon({ IconComponent, size, ...rest }: IconProps) {
  const style = useMemo<CSSProperties>(() => {
    let sizePx = "16px";

    switch (size) {
      case "l":
        sizePx = "32px";
        break;
      case "m":
        sizePx = "24px";
        break;
      case "s":
        sizePx = "16px";
        break;
    }

    return {
      minWidth: sizePx,
      maxWidth: sizePx,
      minHeight: sizePx,
      maxHeight: sizePx,
    };
  }, [size]);

  return <IconComponent {...rest} style={style} />;
}
