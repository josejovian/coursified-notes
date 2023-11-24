import { useMemo } from "react";
import { ChapterAddressType, CourseType, SectionType } from "@/type";
import clsx from "clsx";
import { CourseJourneySection } from "./CourseJourneySection";

interface CourseJourneyProps {
  chapterAddress?: ChapterAddressType;
  className?: string;
  course: CourseType;
  disabled?: boolean;
  noBorder?: boolean;
  noPadding?: boolean;
  scrollable?: boolean;
}

export function CourseJourney({
  course,
  className,
  chapterAddress,
  disabled,
  noBorder,
  noPadding,
  scrollable,
}: CourseJourneyProps) {
  const { id, sections } = course;

  const renderSection = useMemo(
    () => (
      <>
        {sections.map((section) => (
          <CourseJourneySection
            key={section.title}
            chapterAddress={chapterAddress}
            courseId={id}
            disabled={disabled}
            section={section}
            noPadding={noPadding}
          />
        ))}
      </>
    ),
    [chapterAddress, disabled, id, noPadding, sections]
  );

  return (
    <div
      className={clsx(
        "border-zinc-400",
        className,
        scrollable && "overflow-y-scroll",
        !noBorder && "border-t border-x"
      )}
    >
      {renderSection}
    </div>
  );
}
