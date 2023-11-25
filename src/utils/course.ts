import { ColorType } from "../style";
import {
  ChapterAddressType,
  QuizAnswerSheetType,
  RequirementMap,
  SectionType,
} from "../type/Course";
import { uncapitalize } from "./capitalize";

export const regexPracticeInput = /\[input;([^\\])*\]/g;
export const regexPracticeInputWithAnswer = /\[input;([^`])*/g;

export function getPracticeId(string: string) {
  if (!string) return null;

  const split = (string.match(regexPracticeInput) ?? [""])[0].split(";");

  if (split.length !== 2) return null;

  return split[1].slice(0, -1);
}

export function getPracticeAnswer(string: string) {
  if (!string) return null;

  const answer = string.match(regexPracticeInputWithAnswer) ?? [];

  if (answer.length !== 1) return null;

  const question = answer[0].replace(regexPracticeInput, "");

  return question;
}

export function getLocalChapterAddress(section: string, chapter: string) {
  return `${section}/${chapter}`;
}

export function getSpecificChapterAddress(
  chapterAddress: ChapterAddressType,
  string: string
) {
  return {
    ...chapterAddress,
    chapter: `${chapterAddress.chapter}@${string}`,
    page: string === "practice" ? undefined : chapterAddress.page,
  };
}

export function getCourseKey(course: string) {
  return `course-${course}`;
}

export function storeChapterProgress(
  chapterAddress: ChapterAddressType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  answer: any
): void {
  const { course, section, chapter, page } = chapterAddress;
  const localAddress = getLocalChapterAddress(section, chapter);
  const existingAnswer = JSON.parse(
    localStorage.getItem(getCourseKey(course)) ?? "{}"
  );
  if (page !== undefined) {
    if (!existingAnswer[localAddress]) {
      existingAnswer[localAddress] = [];
    }
    existingAnswer[localAddress][page] = answer;
  } else {
    if (!existingAnswer[localAddress]) {
      existingAnswer[localAddress] = {};
    }
    existingAnswer[localAddress] = answer;
  }

  localStorage.setItem(getCourseKey(course), JSON.stringify(existingAnswer));
}

export function checkChapterProgress(
  chapterAddress: ChapterAddressType
): { [key: string]: string } | null {
  const { course, section, chapter } = chapterAddress;
  const localAddress = getLocalChapterAddress(section, chapter);

  const existingAnswer = localStorage.getItem(getCourseKey(course));

  if (existingAnswer) {
    const parsed = JSON.parse(existingAnswer)[localAddress] ?? {};
    return parsed;
  }

  return null;
}

export function checkCourseProgress(id: string, sections: SectionType[]) {
  const rawSectionChapterProgresses = sections.map((section: SectionType) => {
    return section.chapters.map((chapter) => {
      const { requirements } = chapter;

      const localAddress = {
        course: id,
        section: section.id ?? uncapitalize(section.title),
        chapter: chapter.id ?? uncapitalize(chapter.title),
      };

      const localReadAddress = getSpecificChapterAddress(localAddress, "read");

      const localPracticeAddress = getSpecificChapterAddress(
        localAddress,
        "practice"
      );

      if (localAddress.chapter === "quiz") {
        const answer = getQuizAnswerSheet(localAddress);

        if (answer && Object.values(answer))
          return {
            percentage: 1,
            requirements: {
              read: {
                category: "read",
                completed: true,
              },
            } as RequirementMap,
          };
      }

      let readProgress = 0;
      let practiceProgress = 0;

      if (typeof window !== "undefined") {
        const chapterProgress = checkChapterProgress(localReadAddress);
        const chapterPracticeProgress =
          checkChapterProgress(localPracticeAddress);

        if (chapterProgress)
          readProgress = Object.values(chapterProgress).length;

        if (chapterPracticeProgress)
          practiceProgress = Object.values(chapterPracticeProgress).length;
      }

      let requirementsProgresses: RequirementMap = {
        read: undefined,
        practice: undefined,
      };

      if (requirements) {
        requirementsProgresses = {
          read: requirements.read
            ? {
                ...requirements.read,
                params: {
                  ...requirements.read.params,
                  progress: readProgress,
                },
              }
            : undefined,
          practice: requirements.practice
            ? {
                ...requirements.practice,
                params: {
                  ...requirements.practice.params,
                  progress: practiceProgress,
                },
              }
            : undefined,
        };
      }

      return {
        percentage: 0,
        requirements: requirementsProgresses,
      };
    });
  });

  return rawSectionChapterProgresses;
}

export function storeQuizAnswerSheet(
  chapterAddress: ChapterAddressType,
  answer: QuizAnswerSheetType
): void {
  const { course, section, chapter } = chapterAddress;
  const localAddress = getLocalChapterAddress(section, chapter);
  const existingAnswer = JSON.parse(
    localStorage.getItem(getCourseKey(course)) ?? "{}"
  );

  if (!existingAnswer[localAddress]) {
    existingAnswer[localAddress] = {};
  }
  existingAnswer[localAddress] = answer;

  localStorage.setItem(getCourseKey(course), JSON.stringify(existingAnswer));
}

export function getQuizAnswerSheet(
  chapterAddress: ChapterAddressType
): QuizAnswerSheetType | null {
  const { course, section, chapter } = chapterAddress;
  const localAddress = getLocalChapterAddress(section, chapter);
  const existingAnswer = localStorage.getItem(getCourseKey(course));

  if (existingAnswer) {
    const parsed = JSON.parse(existingAnswer)[localAddress] ?? {};
    return parsed;
  }

  return null;
}

export function getPercentGroup(percent: number): ColorType {
  if (percent < 50) return "danger";
  if (percent < 80) return "warning";
  if (percent < 100) return "success";
  return "information";
}

export function getPercent(sheet: QuizAnswerSheetType) {
  const { points, questions } = sheet;

  const maxAchievable = Object.values(questions).reduce((prev, curr) => {
    return prev + curr.weight;
  }, 0);

  const achieved = points ?? 0;

  return Math.ceil((achieved * 100) / maxAchievable);
}
