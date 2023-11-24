import { ReactNode } from "react";
import { IconType } from "react-icons";
import { Icon } from "../Basic/Icon";
import { Paragraph, ParagraphProps } from "./Paragraph";
import clsx from "clsx";
import { FONT_COLOR } from "@/consts";

interface IconTextProps extends ParagraphProps {
  icon: IconType;
  children: ReactNode;
  divClassName?: string;
}

export function IconText({
  icon,
  children,
  divClassName,
  color = "inherit",
  ...props
}: IconTextProps) {
  return (
    <div className={clsx("flex gap-2", divClassName)}>
      <Icon
        IconComponent={icon}
        color={color}
        className={clsx(FONT_COLOR[color])}
      />
      <Paragraph color={color} {...props}>
        {children}
      </Paragraph>
    </div>
  );
}
