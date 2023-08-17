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
  const [update, setUpdate] = useState(0);
  const [sectionData, setSectionData] = useState<SectionType[]>([]);

  const handleSetSectionData = useCallback(() => {
    const sectionProgresses = checkCourseProgress(id, sections);

    setSectionData(
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
      }))
    );
  }, [id, sections]);

  const handleUpdateData = useCallback(() => {
    setUpdate(new Date().getTime());
  }, []);

  useEffect(() => {
    handleSetSectionData();
  }, [update, handleSetSectionData]);

  return {
    sectionData,
    updateData: handleUpdateData,
  };
}
