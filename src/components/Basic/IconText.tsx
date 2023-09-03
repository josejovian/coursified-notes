import { ReactNode } from "react";
import { IconType } from "react-icons";
import { Icon } from "../Basic/Icon";
import { Paragraph, ParagraphProps } from "./Paragraph";
import clsx from "clsx";

interface IconTextProps extends ParagraphProps {
  icon: IconType;
  children: ReactNode;
  divClassName?: string;
}

export function IconText({
  icon,
  children,
  divClassName,
  ...props
}: IconTextProps) {
  return (
    <div className={clsx("flex gap-2", divClassName)}>
      <Icon IconComponent={icon} />
      <Paragraph {...props}>{children}</Paragraph>
    </div>
  );
}
