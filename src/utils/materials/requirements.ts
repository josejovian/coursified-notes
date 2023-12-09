import { ChapterType, RequirementMap, RequirementType } from "@/types";

export function arraifyRequirements(
  requirements: RequirementMap | undefined
): RequirementType[] {
  return requirements
    ? (Object.entries(requirements)
        .filter((x) => x)
        .map(([key, value]) => ({
          ...value,
          category: key,
        })) as RequirementType[])
    : [];
}

export function checkChapterIsComplete(
  requirements: RequirementType[] | undefined
) {
  if (requirements === undefined) return false;

  const allRequirementsCompleted = requirements.filter(
    (requirement) =>
      requirement.params === undefined ||
      requirement.completed ||
      (requirement.params &&
        requirement.params.number &&
        requirement.params.progress &&
        requirement.params.number <= requirement.params.progress)
  );

  return allRequirementsCompleted.length === requirements.length;
}

export function checkChaptersAreComplete(chapters: ChapterType[]) {
  return chapters.map(({ requirements }) =>
    checkChapterIsComplete(arraifyRequirements(requirements))
  );
}

export function getLastFinishedChapter(chapters: ChapterType[]) {
  let result = 0;

  chapters.forEach((chapter, idx) => {
    if (
      chapter.id !== "quiz" &&
      chapter.requirements &&
      checkChapterIsComplete(arraifyRequirements(chapter.requirements))
    ) {
      result = idx + 1;
    }
  });

  return result;
}
