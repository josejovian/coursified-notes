import remarkGfm from "remark-gfm";
import {
  CourseType,
  ChapterType,
  PageType,
  RequirementCategoryType,
  RequirementMap,
  SectionType,
} from "../type/Course";
import { bundleMDX } from "mdx-bundler";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const { readdirSync, readFileSync } = require("fs");
const { join } = require("path");

const BASE_MATERIALS_DIRECTORY = "src/materials";

export async function readCourse(course: string) {
  const result = await readFileSync(
    join(process.cwd(), BASE_MATERIALS_DIRECTORY, `${course}/index.json`),
    "utf8"
  );

  return result;
}

export async function readAllCourses() {
  const result: string[] = await readdirSync(
    join(process.cwd(), BASE_MATERIALS_DIRECTORY),
    "utf8"
  );
  return result;
}

export async function readSection(course: string, section: string) {
  const result = await readFileSync(
    join(
      process.cwd(),
      `${BASE_MATERIALS_DIRECTORY}/${course}/${section}/index.json`
    ),
    "utf8"
  );
  return JSON.parse(result);
}

export async function readAllSections(course: string) {
  const result = await readdirSync(
    join(process.cwd(), `${BASE_MATERIALS_DIRECTORY}/${course}`),
    "utf8"
  );
  return result;
}

export async function readAllChapters(course: string, section: string) {
  const result = await readdirSync(
    join(process.cwd(), `${BASE_MATERIALS_DIRECTORY}/${course}/${section}`),
    "utf8"
  );
  return result;
}

export async function readChapter(
  course: string,
  section: string,
  chapter: string
) {
  const result = readFileSync(
    join(
      process.cwd(),
      `${BASE_MATERIALS_DIRECTORY}/${course}/${section}/${chapter}.mdx`
    ),
    "utf8"
  );
  return result;
}

export async function readChapterMd(
  course: string,
  section: string,
  chapter: string
) {
  const raw = await readChapter(course, section, chapter);

  const split = raw.split("===");

  const results = await Promise.all(
    split.map(async (page: string) => {
      return await bundleMDX({
        source: page,

        mdxOptions(options, frontmatter) {
          options.remarkPlugins = [
            ...(options.remarkPlugins ?? []),
            remarkGfm,
            remarkMath,
          ];
          options.rehypePlugins = [
            ...(options.rehypePlugins ?? []),
            rehypeKatex,
          ];

          return options;
        },
      });
    })
  );

  return {
    pages: results,
  };
}

function sortData(data: any[], index: any[], variable: string = "id") {
  return data.sort((a, b) => {
    if (a[variable] && b[variable]) {
      const indexA = index.indexOf(a.id);
      const indexB = index.indexOf(b.id);

      if (indexA > indexB) return 1;
      if (indexA == indexB) return 0;
      if (indexA < indexB) return -1;
    }
    return 0;
  });
}

export async function getDetailedCourse(course: string) {
  let result = await readCourse(course);
  result = JSON.parse(result) as CourseType;
  result.id = course;

  const sections = await readAllSections(course);

  const sectionsData = (await Promise.all(
    sections.map(async (section: string) => {
      if (section.includes(".")) {
        return null;
      }

      const {
        title = section,
        overrideChapterTitles,
        quiz,
      } = await readSection(course, section);

      const sectionData: SectionType = {
        id: section,
        title: title,
        chapters: [],
      };

      const chapters = await readAllChapters(course, section);

      const hasQuiz = chapters.some((chapter: string) => {
        return chapter === "quiz.mdx";
      });

      const detectedChapters = (await Promise.all(
        chapters.map(async (chapterRaw: string) => {
          const [chapter, extension] = chapterRaw.split(".");

          if (extension === "json") return null;

          const chapterContents = await readChapter(course, section, chapter);
          const pages = chapterContents.split(/\=\=\=/);

          let countQuestions = 0;

          const completePages = pages.map((page: any): PageType => {
            let pageType: RequirementCategoryType = "read";

            const questions = page.match(/\<Practice/g) ?? [];

            countQuestions += questions.length;

            return {
              category: pageType,
              problemCount: questions.length,
            };
          }, []);

          let requirements: RequirementMap = {
            read: undefined,
            practice: undefined,
          };

          if (completePages.length > 0) {
            requirements = {
              ...requirements,
              read: {
                category: "read",
                params: {
                  number: completePages.length,
                },
              },
            };
          }

          if (countQuestions > 0) {
            requirements = {
              ...requirements,
              practice: {
                category: "practice",
                params: {
                  number: countQuestions,
                },
              },
            };
          }

          const chapterTitle = (() => {
            if (chapter === "quiz") return "Quiz";
            if (overrideChapterTitles)
              return overrideChapterTitles[chapter] ?? chapter;
            return chapter;
          })();

          return {
            id: chapter,
            title: chapterTitle,
            requirements,
            pages: completePages,
          } as ChapterType;
        })
      )
        .then((result) => result.filter((x) => x))
        .catch()) as ChapterType[];

      const topicIndexes = Object.keys(overrideChapterTitles);

      sectionData.chapters = sortData(
        detectedChapters,
        hasQuiz ? [...topicIndexes, "quiz"] : topicIndexes
      );

      sectionData.quiz = quiz;
      console.log(quiz);

      return sectionData;
    })
  )
    .then((result) => result.filter((x) => x))
    .catch()) as SectionType[];

  const topicIndexes = Object.values(result.sections);
  result.sections = sortData(sectionsData, topicIndexes);

  return result;
}
