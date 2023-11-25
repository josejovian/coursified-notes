import { useState, ReactNode } from "react";
import clsx from "clsx";
import { MdOutlineExpandMore } from "react-icons/md";
import { Icon, Paragraph } from "../../Basic";

interface CourseLayoutSideSectionProps {
  title?: string;
  caption?: string;
  className?: string;
  children?: ReactNode;
  noExpand?: boolean;
  noPadding?: boolean;
}

export function CourseLayoutSideSection({
  title,
  caption,
  className,
  children,
  noExpand,
  noPadding,
}: CourseLayoutSideSectionProps) {
  const [open, setOpen] = useState(true);

  return (
    <>
      <div
        className={clsx(
          noPadding ? ROW_STYLE_2 : ROW_STYLE,
          "relative flex",
          "border-b border-zinc-400 bg-zinc-100",
          !noExpand && "cursor-pointer",
          className
        )}
        onClick={() => !noExpand && setOpen((prev) => !prev)}
      >
        <Icon
          IconComponent={MdOutlineExpandMore}
          className={clsx(
            noExpand && "hidden",
            noPadding ? "mr-5" : "mr-4",
            "-my-1 transition-all",
            open ? "-rotate-180" : "rotate-0"
          )}
          size="m"
        />
        <span className="w-full flex justify-between gap-4 items-start h-min">
          <Paragraph className="flex-wrap" weight="bold">
            {title}
          </Paragraph>
          <Paragraph className=" w-max whitespace-nowrap">{caption}</Paragraph>
        </span>
      </div>
      {open && <div className="border-b border-zinc-400">{children}</div>}
    </>
  );
}

const ROW_STYLE = clsx(["py-4 pl-4 pr-8 md:pl-12 md:pr-16"]);
const ROW_STYLE_2 = clsx(["py-4 pl-4 pr-6 md:pl-8 md:pr-12"]);
