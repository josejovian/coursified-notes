import { ReactNode } from "react";
import clsx from "clsx";
import { ToggleLink } from "@/src/components";

interface CourseProgressVerticalMilestoneProps {
  indexText: string;
  title: string;
  id?: string;
  caption?: ReactNode;
  styling?: string;
  link?: string;
}

export function CourseProgressVerticalMilestone({
  indexText,
  title,
  id,
  caption,
  styling = "",
  link,
}: CourseProgressVerticalMilestoneProps) {
  return (
    <ToggleLink className="text-lg my-4" href={link} disabled={!link}>
      <article
        id={id}
        className={clsx(
          "ProgressMilestone",
          "w-max p-4 bg-gray-100 rounded-md",
          styling
        )}
      >
        <span className="flex flex-col">
          <span className="ProgressMilestone_indexText text-gray-500 text-sm font-medium">
            {indexText}
          </span>
          <h3 className="ProgressMilestone_title text-2xl font-normal">
            {title}
          </h3>
          {caption}
        </span>
      </article>
    </ToggleLink>
  );
}
