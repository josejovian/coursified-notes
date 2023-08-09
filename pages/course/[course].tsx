import { Fragment, useMemo, useState, useEffect } from "react";
import { Section, SlantedBackgroundTemplate } from "@/src/components";
import { SectionType } from "@/src/type";
import { checkCourseProgress } from "@/src/utils";
import { useProgress } from "@/src/hooks/materials/useProgress";
import { readAllCourses, getDetailedCourse } from "@/src/lib/mdx";

interface CourseProps {
  details: string;
}

const Course = ({ details }: CourseProps) => {
  const {
    id,
    title,
    description,
    sections = [] as SectionType[],
  } = useMemo(() => JSON.parse(details), [details]);

  const sectionData = useProgress({ id, sections });

  const renderCourseHeader = useMemo(
    () => (
      <div className="flex flex-col gap-4">
        <h1 className="text-6xl">{title}</h1>
        <p className="text-2xl leading-10">{description}</p>
      </div>
    ),
    [title, description]
  );

  const renderCourseSections = useMemo(
    () => (
      <div className="grid grid-cols-1 gap-4">
        {sectionData.map((section: SectionType, index: number) => {
          return (
            <Fragment key={`${title}-${section.title}`}>
              <Section
                courseId={id}
                caption={`Section ${index + 1}`}
                section={section}
                index={index + 1}
              />
            </Fragment>
          );
        })}
      </div>
    ),
    [id, sectionData, title]
  );

  return (
    <SlantedBackgroundTemplate header={renderCourseHeader}>
      {renderCourseSections}
    </SlantedBackgroundTemplate>
  );
};

export const getStaticPaths = async () => {
  // const { readAllCourses } = require("../../src/lib/mdx.tsx");
  const courses: string[] = await readAllCourses();

  return {
    paths: courses.map((course) => ({
      params: {
        course: course.replace(".mdx", ""),
      },
    })),
    fallback: false,
  };
};

export const getStaticProps = async (req: any) => {
  const { course } = req.params;
  // const { readCourse, getDetailedCourse } = require("../../src/lib/mdx.tsx");

  const details = await getDetailedCourse(course);

  return {
    props: { details: JSON.stringify(details) },
  };
};

export default Course;
