import { ChapterType, SectionType } from "@/src/type";
import { MdOutlineDescription, MdOutlineExpandMore } from "react-icons/md";
import { Icon } from "../../Basic/Icon";
import { checkChaptersAreComplete, getLastFinishedChapter } from "@/src/utils";
import clsx from "clsx";
import { useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { Paragraph } from "../../Basic";

interface CourseLayoutSideSectionChapterProps {
	title: string;
  status: "locked" | "unlocked" | "completed";
  onClick?: () => void;
  className?: string;
  active?: boolean;
}

export function CourseLayoutSideSectionChapter({
	title,
  status,
  onClick,
  className,
  active,
}: CourseLayoutSideSectionChapterProps) {
  return (
    <div
      className={clsx(
        "flex items-center",
        status === "completed" && [
          "hover:bg-success-2 hover:bg-success-2",
          active && "bg-success-1",
        ],
        status === "unlocked" && [
          "hover:bg-orange-100",
          active && "bg-orange-50",
        ],
        status !== "locked" && "cursor-pointer",
				status === "completed" && "text-success-6",
				status === "locked" && "text-secondary-4",
				status === "unlocked" && "text-orange-600",
        className
      )}
      key={title}
      onClick={onClick}
    >
      <Icon IconComponent={MdOutlineDescription} className="mr-4 text-inherit" size="m" />
      <Paragraph
				as="p"
        className="truncate"
				color="inherit"
      >
        {title}
      </Paragraph>
    </div>
  );
}
