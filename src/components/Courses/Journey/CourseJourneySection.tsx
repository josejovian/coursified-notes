import { SectionType } from "@/src/type";
import { MdOutlineDescription, MdOutlineExpandMore } from "react-icons/md";
import { Icon } from "../../Basic/Icon";
import { checkChaptersAreComplete, getLastFinishedChapter } from "@/src/utils";
import clsx from "clsx";
import { useCallback, useMemo, useState } from "react";
import { CourseJourneySectionChapter } from "./CourseJourneySectionChapter";
import { useRouter } from "next/router";

interface CourseJourneySectionProps {
  courseId: string;
  section: SectionType;
}

export function CourseJourneySection({
  courseId,
  section,
}: CourseJourneySectionProps) {
  const { title, chapters } = section;

  const [open, setOpen] = useState(true);
  const router = useRouter();

  const lastFinishedChapter = useMemo(
    () => getLastFinishedChapter(chapters),
    [chapters]
  );

  const chaptersComplete = useMemo(
    () => checkChaptersAreComplete(chapters),
    [chapters]
  );

  const handleGetStatusForChapter = useCallback(
    (index: number) => {
      if (lastFinishedChapter > index) return "completed";

      if (index === 0 || lastFinishedChapter === index) return "unlocked";

      return "locked";
    },
    [lastFinishedChapter]
  );

  return (
    <>
      <div
        className={clsx(
          ROW_STYLE,
          "relative flex items-center",
          "border-b border-zinc-400 bg-zinc-100",
          "font-bold cursor-pointer"
        )}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Icon IconComponent={MdOutlineExpandMore} className="mr-4" size="m" />
        <span className="w-full flex justify-between">
          <span>{title}</span>
          <span className="justify-self-end place-self-end">
            {lastFinishedChapter} / {chapters.length}
          </span>
        </span>
      </div>
      {open && (
        <div className="border-b border-zinc-400">
          {chapters.map((chapter, index) => (
            <CourseJourneySectionChapter
              key={chapter.title}
              chapter={chapter}
              status={handleGetStatusForChapter(index)}
              onClick={() => {
                router.push(`/course/${courseId}/${section.id}/${chapter.id}`);
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}

const ROW_STYLE = clsx(["py-4 px-16"]);
const CHAPTER_BASE_STYLE = "transition-colors";
const CHAPTER_LOCKED_STYLE = "text-secondary-4";
const CHAPTER_UNLOCKED_STYLE =
  "text-orange-600 hover:text-orange-700 underline";
const CHAPTER_COMPLETED_STYLE = "text-success-6 hover:text-success-2";
