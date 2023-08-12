import clsx from "clsx";
import { HTMLProps, useMemo } from "react";
import { IconType, IconBaseProps as IconLibProps } from "react-icons";
import { MdExpandMore } from "react-icons/md";

interface IconBaseProps {
  IconComponent: IconType;
  size?: "s" | "m" | "l";
}

type IconProps = IconBaseProps & Omit<IconLibProps, keyof IconBaseProps>;

export function Icon({ IconComponent, size, ...rest }: IconProps) {
  const { className: classProps } = rest;

  const className = useMemo(() => {
    let sizeClass = "";

    switch (size) {
      case "l":
        sizeClass = "w-8 h-8";
        break;
      case "m":
        sizeClass = "w-6 h-6";
        break;
      case "s":
        sizeClass = "w-4 h-4";
        break;
    }

    return clsx(classProps, sizeClass);
  }, [classProps, size]);

  return <IconComponent {...rest} className={className} />;
}
