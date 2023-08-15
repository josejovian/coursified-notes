import { useMemo } from "react";
import { ChapterAddressType, CourseType, SectionType } from "@/src/type";
import clsx from "clsx";
import { MdOutlineDescription, MdOutlineExpandMore } from "react-icons/md";
import { Icon } from "../../Basic/Icon";
import { checkChaptersAreComplete, getLastFinishedChapter } from "@/src/utils";
import { CourseJourneySection } from "./CourseJourneySection";

interface CourseJourneyProps {
  chapterAddress?: ChapterAddressType;
  className?: string;
  course: CourseType;
  disabled?: boolean;
  noBorder?: boolean;
  noPadding?: boolean;
}

export function CourseJourney({
  course,
  className,
  chapterAddress,
  disabled,
  noBorder,
  noPadding,
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
        !noBorder && "border-t border-x"
      )}
    >
      {renderSection}
    </div>
  );
}
