import { useMemo } from "react";
import { CourseType, SectionType } from "@/src/type";
import clsx from "clsx";
import { MdOutlineDescription, MdOutlineExpandMore } from "react-icons/md";
import { Icon } from "../../Basic/Icon";
import { checkChaptersAreComplete, getLastFinishedChapter } from "@/src/utils";
import { CourseJourneySection } from "./CourseJourneySection";

interface CourseJourneyProps {
  course: CourseType;
  className?: string;
  noVerticalBorder?: boolean;
  noPadding?: boolean;
}

export function CourseJourney({
  course,
  className,
  noVerticalBorder,
  noPadding,
}: CourseJourneyProps) {
  const { id, sections } = course;

  const renderSection = useMemo(
    () => (
      <>
        {sections.map((section) => (
          <CourseJourneySection
            key={section.title}
            courseId={id}
            section={section}
            noPadding={noPadding}
          />
        ))}
      </>
    ),
    [id, noPadding, sections]
  );

  return (
    <div
      className={clsx(
        "border-t border-zinc-400",
        className,
        !noVerticalBorder && "border-x"
      )}
    >
      {renderSection}
    </div>
  );
}
