import { SectionType } from "@/src/type";
import { MdOutlineDescription, MdOutlineExpandMore } from "react-icons/md";
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
  noPadding?: boolean;
}

export function CourseJourneySection({
  courseId,
  section,
  className,
  noPadding,
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
          "relative flex items-center",
          "border-b border-zinc-400 bg-zinc-100",
          "font-bold cursor-pointer",
          className
        )}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Icon
          IconComponent={MdOutlineExpandMore}
          className={noPadding ? "mr-5" : "mr-4"}
          size="m"
        />
        <span className="w-full flex justify-between">
          <Paragraph>{title}</Paragraph>
          <Paragraph className="justify-self-end place-self-end">
            {lastFinishedChapter} / {chapters.length}
          </Paragraph>
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
              className={clsx(className, noPadding ? ROW_STYLE_2 : ROW_STYLE)}
            />
          ))}
        </div>
      )}
    </>
  );
}

const ROW_STYLE = clsx(["py-4 pl-12 pr-16"]);
const ROW_STYLE_2 = clsx(["py-4 pl-8 pr-12"]);
