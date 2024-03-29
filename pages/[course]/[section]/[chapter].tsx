import "katex/dist/katex.min.css";
import {
  readAllChapters,
  readAllSections,
  readAllCourses,
  getDetailedCourse,
  readChapterMd,
} from "@/lib/mdx";
import { ChapterAddressType, CourseType } from "@/types";
import { CoursePage } from "@/features/course";

interface _CourseMaterialProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  markdown: any;
  chapterAddress: ChapterAddressType;
  rawCourseDetail: string;
}

export const getStaticPaths = async () => {
  const courses: string[] = await readAllCourses();

  const strings = await Promise.all(
    courses.map(async (course) => {
      const sections: string[] = await readAllSections(course);
      console.log("GetStaticPaths");
      console.log(sections.filter((x) => !x.includes(".json")));
      return await Promise.all(
        sections
          .filter((x) => !x.includes(".json"))
          .map(async (section) => {
            const chapters: string[] = await readAllChapters(course, section);
            console.log("Chapters: ");
            console.log(chapters);
            return await Promise.all(
              chapters
                .filter((c) => !c.includes(".json"))
                .map((chapter) => ({
                  params: {
                    course: course,
                    section: section,
                    chapter: chapter.replace(".mdx", ""),
                  },
                }))
            );
          })
      );
    })
  );

  return {
    paths: strings.flat(4),
    fallback: false,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getStaticProps = async (req: any) => {
  const { course, section, chapter } = req.params;

  const params = { course, section, chapter };

  const { pages } = await readChapterMd(course, section, chapter);

  const courseDetail = (await getDetailedCourse(course)) as CourseType;

  const sectionIndex = courseDetail.sections.findIndex((value) => {
    return section === value.id;
  });

  return {
    props: {
      markdown: pages,
      chapterAddress: {
        ...params,
        sectionIndex,
      },
      rawCourseDetail: JSON.stringify(courseDetail),
    },
  };
};

export default CoursePage;
