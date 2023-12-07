import { ReactNode, useMemo } from "react";
import clsx from "clsx";
import { MdOutlineAssignment, MdOutlineDescription } from "react-icons/md";
import { Icon, Paragraph } from "@/components";
import { ChapterType } from "@/types";

interface CourseJourneySectionChapterProps {
  chapter: ChapterType;
  status: "locked" | "unlocked" | "completed";
  onClick?: () => void;
  className?: string;
  active?: boolean;
  rightElement?: ReactNode;
}

export function CourseJourneySectionChapter({
  chapter,
  status,
  onClick,
  className,
  active,
  rightElement,
}: CourseJourneySectionChapterProps) {
  const icon = useMemo(() => {
    if (chapter.id === "quiz") {
      return MdOutlineAssignment;
    }
    return MdOutlineDescription;
  }, [chapter.id]);

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
      key={chapter.title}
      onClick={onClick}
    >
      <Icon IconComponent={icon} className="mr-4 text-inherit" size="m" />
      <Paragraph as="p" className="truncate" color="inherit">
        {chapter.title}
      </Paragraph>
      {rightElement}
    </div>
  );
}
