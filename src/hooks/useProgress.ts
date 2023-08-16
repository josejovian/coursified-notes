import { Fragment, useMemo, useState, useEffect, useCallback } from "react";
import {
  ChapterType,
  RequirementMap,
  RequirementType,
  SectionType,
} from "../type";
import { checkCourseProgress } from "../utils";

interface UseProgressProps {
  id: string;
  sections: SectionType[];
}

export function useProgress({ id, sections }: UseProgressProps) {
  const [sectionData, setSectionData] = useState<SectionType[]>([]);

  const sectionProgresses = useMemo(
    () => checkCourseProgress(id, sections),
    [id, sections]
  );

  const completeSections = useMemo(
    () =>
      sections.map((section: SectionType, index: number) => ({
        ...section,
        chapters: section.chapters.map((chapter, index2: number) => {
          const { percentage, requirements } = sectionProgresses[index][index2];
          return {
            ...chapter,
            requirements,
            percentage,
          };
        }),
      })),
    [sectionProgresses, sections]
  );

  useEffect(() => {
    setSectionData(completeSections);
  }, [completeSections]);

  return sectionData;
}
