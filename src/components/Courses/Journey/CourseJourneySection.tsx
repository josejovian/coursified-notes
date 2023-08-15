import { ChapterAddressType, SectionType } from "@/src/type";
import { MdOutlineExpandMore } from "react-icons/md";
import { Icon } from "../../Basic/Icon";
import { checkChaptersAreComplete, getLastFinishedChapter } from "@/src/utils";
import clsx from "clsx";
import { useCallback, useMemo, useState } from "react";
import { CourseJourneySectionChapter } from "./CourseJourneySectionChapter";
import { useRouter } from "next/router";
import { Paragraph } from "../../Basic";

interface CourseJourneySectionProps {
  courseId: string;
  section: SectionType;
  className?: string;
  disabled?: boolean;
  chapterAddress?: ChapterAddressType;
  noPadding?: boolean;
}

export function CourseJourneySection({
  courseId,
  section,
  className,
  disabled,
  noPadding,
  chapterAddress,
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
          noPadding ? ROW_STYLE_2 : ROW_STYLE,
          "relative flex",
          "border-b border-zinc-400 bg-zinc-100",
          "cursor-pointer",
          className
        )}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Icon
          IconComponent={MdOutlineExpandMore}
          className={clsx(
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
          <Paragraph className=" w-max whitespace-nowrap">
            {lastFinishedChapter} / {chapters.length}
          </Paragraph>
        </span>
      </div>
      {open && (
        <div className="border-b border-zinc-400">
          {chapters.map((chapter, index) => {
            const status = handleGetStatusForChapter(index);
            return (
              <CourseJourneySectionChapter
                key={chapter.title}
                chapter={chapter}
                status={status}
                onClick={() => {
                  status !== "locked" &&
                    !disabled &&
                    router.push(
                      `/course/${courseId}/${section.id}/${chapter.id}`
                    );
                }}
                className={clsx(className, noPadding ? ROW_STYLE_2 : ROW_STYLE)}
                active={
                  chapter.id === chapterAddress?.chapter &&
                  section.id === chapterAddress?.section
                }
              />
            );
          })}
        </div>
      )}
    </>
  );
}

const ROW_STYLE = clsx(["py-4 pl-12 pr-16"]);
const ROW_STYLE_2 = clsx(["py-4 pl-8 pr-12"]);
