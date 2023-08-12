import { useMemo } from "react";
import { CourseType, SectionType } from "@/src/type";
import clsx from "clsx";
import { MdOutlineDescription, MdOutlineExpandMore } from "react-icons/md";
import { Icon } from "../../Basic/Icon";
import { checkChaptersAreComplete, getLastFinishedChapter } from "@/src/utils";
import { CourseJourneySection } from "./CourseJourneySection";

interface CourseJourneyProps {
  course: CourseType;
}

export function CourseJourney({ course }: CourseJourneyProps) {
  const { id, sections } = course;

  const renderSection = useMemo(
    () => (
      <>
        {sections.map((section) => (
          <CourseJourneySection
            key={section.title}
            courseId={id}
            section={section}
          />
        ))}
      </>
    ),
    [id, sections]
  );

  return (
    <div className="border-x border-t border-zinc-400">{renderSection}</div>
  );
}

const ROW_STYLE = clsx(["py-4 px-16"]);
