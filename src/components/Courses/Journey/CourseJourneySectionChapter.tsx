import { ChapterType, SectionType } from "@/src/type";
import { MdOutlineDescription, MdOutlineExpandMore } from "react-icons/md";
import { Icon } from "../../Basic/Icon";
import { checkChaptersAreComplete, getLastFinishedChapter } from "@/src/utils";
import clsx from "clsx";
import { useCallback, useMemo } from "react";
import { useRouter } from "next/router";

interface CourseJourneySectionChapterProps {
  chapter: ChapterType;
  status: "locked" | "unlocked" | "completed";
  onClick?: () => void;
}

export function CourseJourneySectionChapter({
  chapter,
  status,
  onClick,
}: CourseJourneySectionChapterProps) {
  return (
    <div
      className={clsx(ROW_STYLE, "flex items-center cursor-pointer")}
      key={chapter.title}
      onClick={onClick}
    >
      <Icon IconComponent={MdOutlineDescription} className="mr-4" size="m" />
      <span
        className={clsx(
          CHAPTER_BASE_STYLE,
          status === "completed" && CHAPTER_COMPLETED_STYLE,
          status === "locked" && CHAPTER_LOCKED_STYLE,
          status === "unlocked" && CHAPTER_UNLOCKED_STYLE
        )}
      >
        {chapter.title}
      </span>
    </div>
  );
}

const ROW_STYLE = clsx(["py-4 px-16"]);
const CHAPTER_BASE_STYLE = "transition-colors";
const CHAPTER_LOCKED_STYLE = "text-secondary-4";
const CHAPTER_UNLOCKED_STYLE =
  "text-orange-600 hover:text-orange-700 underline";
const CHAPTER_COMPLETED_STYLE = "text-success-6 hover:text-success-2";
