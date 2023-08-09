import clsx from "clsx";
import { Fragment, useCallback, useMemo, useState } from "react";
import { BsCheckSquareFill, BsChevronLeft, BsSquare } from "react-icons/bs";
import {
  ChapterType,
  RequirementCategoryType,
  RequirementMap,
  RequirementType,
  SectionType,
} from "@/src/type";
import { CourseProgressVertical } from "@/src/components";
import {
  arraifyRequirements,
  checkChapterIsComplete,
  checkChaptersAreComplete,
  getLastFinishedChapter,
} from "@/src/utils";

const CHAPTER_BASE_STYLE = "transition-colors";
const CHAPTER_LOCKED_STYLE = "bg-secondary-1";
const CHAPTER_UNLOCKED_STYLE = "bg-warning-1 hover:bg-warning-2";
const CHAPTER_COMPLETED_STYLE = "bg-success-1 hover:bg-success-2";

interface SectionProps {
  section: SectionType;
  courseId: string;
  caption?: string;
  index?: number;
}

export function Section({ caption, courseId, index, section }: SectionProps) {
  const { title, chapters } = section;

  const [open, setOpen] = useState(true);

  const lastFinishedChapter = useMemo(
    () => getLastFinishedChapter(chapters),
    [chapters]
  );

  const chaptersComplete = useMemo(
    () => checkChaptersAreComplete(chapters),
    [chapters]
  );

  const handleGetStylingForChapter = useCallback(
    (index: number) => {
      const SPECIFIC_STYLE = (function () {
        if (lastFinishedChapter > index) return CHAPTER_COMPLETED_STYLE;

        if (index === 0 || lastFinishedChapter === index)
          return CHAPTER_UNLOCKED_STYLE;

        return CHAPTER_LOCKED_STYLE;
      })();
      return clsx(CHAPTER_BASE_STYLE, SPECIFIC_STYLE);
    },
    [lastFinishedChapter]
  );

  const handleGetRequirementMessage = useCallback(
    (type: RequirementCategoryType | undefined, params?: any | undefined) => {
      console.log(params);

      const progress =
        params &&
        params.progress &&
        params.number &&
        params.number > params.progress
          ? `(${Math.min(params.progress, params.number)}/${params.number}) `
          : params
          ? params.number
          : 0;

      const s = params && params.number > 1 ? "s" : "";

      switch (type) {
        case "read":
          return `Read ${progress} page${s} of material`;
        case "practice":
          return `Solve ${progress} practice problem${s}`;
        default:
          return "";
      }
    },
    []
  );

  const renderChapterRequirements = useCallback(
    (section: string, requirements: RequirementType[]) => {
      return (
        <Fragment>
          <ul className="flex flex-col gap-2 mt-2">
            {requirements.map((requirement, idx) => {
              let completed = Boolean(
                requirement.params &&
                  requirement.params.progress &&
                  requirement.params.number &&
                  requirement.params.progress >= requirement.params.number
              );

              return (
                <li
                  key={`${section}-${idx}`}
                  className={clsx(
                    "flex items-center gap-2",
                    !requirement.params && "hidden"
                  )}
                >
                  <span
                    className={clsx(
                      "Icon",
                      completed ? "text-green-600" : "text-gray-700"
                    )}
                  >
                    {completed ? <BsCheckSquareFill /> : <BsSquare />}
                  </span>
                  <span className="text-gray-600 text-sm">
                    {handleGetRequirementMessage(
                      requirement.category,
                      requirement.params
                    )}{" "}
                  </span>
                </li>
              );
            })}
          </ul>
        </Fragment>
      );
    },
    [handleGetRequirementMessage]
  );

  return (
    <article className="border-gray-300 border rounded-md" key={title}>
      <div
        className="p-8 w-full flex justify-between items-center cursor-pointer"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div>
          {caption && (
            <span className="text-secondary-7 text-xl">{caption}</span>
          )}
          <h2 className="font-semibold text-primary-6">{title}</h2>
        </div>
        <div className="flex items-center gap-8">
          <span className="text-secondary-6">
            {lastFinishedChapter} / {chapters.length}
          </span>
          <span
            className={clsx(
              "Icon-xl transition-all text-primary-6",
              open ? "-rotate-90" : "rotate-0"
            )}
          >
            <BsChevronLeft />
          </span>
        </div>
      </div>
      {open && (
        <div className="px-8 pb-8">
          <CourseProgressVertical
            title={title}
            milestones={chapters.map((chapter) => `${chapter.title}`)}
            indexTemplate={(idx) => `Chapter ${index}.${idx}`}
            progress={lastFinishedChapter}
            stylings={chapters.map((_, idx) => handleGetStylingForChapter(idx))}
            links={chapters.map((chapter, idx) =>
              idx === 0 || chaptersComplete[idx] || chaptersComplete[idx - 1]
                ? `/course/${courseId}/${section.id}/${chapter.id}`
                : "#"
            )}
          />
        </div>
      )}
    </article>
  );
}
