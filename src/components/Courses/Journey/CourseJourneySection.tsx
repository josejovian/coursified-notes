import { ChapterAddressType, SectionType } from "@/src/type";
import { MdOutlineExpandMore } from "react-icons/md";
import { Icon } from "../../Basic/Icon";
import {
  checkChaptersAreComplete,
  getLastFinishedChapter,
  getPercent,
  getPercentGroup,
  getQuizAnswerSheet,
} from "@/src/utils";
import clsx from "clsx";
import { useCallback, useMemo, useState } from "react";
import { CourseJourneySectionChapter } from "./CourseJourneySectionChapter";
import { useRouter } from "next/router";
import { Badge, Paragraph } from "../../Basic";
import { CourseLayoutSideSection } from "../Layout/CourseLayoutSideSection";

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

  const router = useRouter();

  const lastFinishedChapter = useMemo(
    () => getLastFinishedChapter(chapters),
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
    <CourseLayoutSideSection
      className={className}
      title={title}
      caption={`${lastFinishedChapter} / ${chapters.length}`}
      noPadding={noPadding}
    >
      {chapters.map((chapter, index) => {
        const status = handleGetStatusForChapter(index);
        const sheet =
          chapter.id === "quiz" &&
          chapterAddress &&
          getQuizAnswerSheet({
            ...chapterAddress,
            chapter: "quiz",
          });

        console.log(chapterAddress);

        let percent: number | undefined;

        if (sheet) {
          percent = getPercent(sheet);
        }

        return (
          <CourseJourneySectionChapter
            key={chapter.title}
            chapter={chapter}
            status={status}
            onClick={() => {
              status !== "locked" &&
                !disabled &&
                router.push(`/${courseId}/${section.id}/${chapter.id}`);
            }}
            className={clsx(className, noPadding ? ROW_STYLE_2 : ROW_STYLE)}
            active={
              chapter.id === chapterAddress?.chapter &&
              section.id === chapterAddress?.section
            }
            rightElement={
              !!percent && (
                <Badge className="ml-4" color={getPercentGroup(percent)}>
                  {percent}%
                </Badge>
              )
            }
          />
        );
      })}
    </CourseLayoutSideSection>
  );
}

const ROW_STYLE = clsx(["py-4 pl-4 pr-8 md:pl-12 md:pr-16"]);
const ROW_STYLE_2 = clsx(["py-4 pl-4 pr-6 md:pl-8 md:pr-12"]);
