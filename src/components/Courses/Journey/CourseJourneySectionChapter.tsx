import { ChapterType, SectionType } from "@/src/type";
import { MdOutlineDescription, MdOutlineExpandMore } from "react-icons/md";
import { Icon } from "../../Basic/Icon";
import { checkChaptersAreComplete, getLastFinishedChapter } from "@/src/utils";
import clsx from "clsx";
import { useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { Paragraph } from "../../Basic";

interface CourseJourneySectionChapterProps {
  chapter: ChapterType;
  status: "locked" | "unlocked" | "completed";
  onClick?: () => void;
  className?: string;
}

export function CourseJourneySectionChapter({
  chapter,
  status,
  onClick,
  className,
}: CourseJourneySectionChapterProps) {
  return (
    <div
      className={clsx("flex items-center cursor-pointer", className)}
      key={chapter.title}
      onClick={onClick}
    >
      <Icon IconComponent={MdOutlineDescription} className="mr-4" size="m" />
      <Paragraph
        className={clsx(
          CHAPTER_BASE_STYLE,
          status === "completed" && CHAPTER_COMPLETED_STYLE,
          status === "locked" && CHAPTER_LOCKED_STYLE,
          status === "unlocked" && CHAPTER_UNLOCKED_STYLE,
          "truncate"
        )}
      >
        {chapter.title}
      </Paragraph>
    </div>
  );
}

const ROW_STYLE = clsx(["py-4 px-16"]);
const CHAPTER_BASE_STYLE = "transition-colors";
const CHAPTER_LOCKED_STYLE = "text-secondary-4";
const CHAPTER_UNLOCKED_STYLE = "text-orange-600 underline";
const CHAPTER_COMPLETED_STYLE = "text-success-6 hover:text-success-2";
