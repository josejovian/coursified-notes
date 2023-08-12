import { Fragment, useMemo, useState, useEffect } from "react";
import {
  CourseJourney,
  Section,
  SlantedBackgroundTemplate,
} from "@/src/components";
import { CourseType, SectionType } from "@/src/type";
import { checkCourseProgress } from "@/src/utils";
import { useProgress } from "@/src/hooks/materials/useProgress";
import { readAllCourses, getDetailedCourse } from "@/src/lib/mdx";
import Image from "next/image";
import clsx from "clsx";

interface CourseProps {
  details: string;
}

const Course = ({ details }: CourseProps) => {
  const course = useMemo<CourseType>(() => JSON.parse(details), [details]);

  const { id, title, description, sections = [] } = course;

  const sectionData = useProgress({ id, sections });

  const renderCourseJourney = useMemo(
    () => <CourseJourney course={course} />,
    [course]
  );

  return (
    <div>
      <div className="relative mx-auto w-full h-60 bg-black overflow-hidden">
        <div
          className={clsx(
            "absolute top-0 h-60",
            "flex flex-col justify-center gap-4",
            "text-white mx-auto z-10"
          )}
          style={{
            width: "1024px",
            left: "50%",
            transform: `translate(-50%, 0%)`,
          }}
        >
          <h1>Calculus</h1>
          <span>
            My old calculus notes transformed into a course-like format.
          </span>
          <span>Jose Jovian</span>
        </div>
        <Image
          src="/train.jpg"
          width="1920"
          height="512"
          className="absolute top-0 left-0 object-none object-center opacity-20"
        />
      </div>
      <div className="mx-auto py-16" style={{ width: "1024px" }}>
        <h2 className="font-bold mb-8">Contents</h2>
        {renderCourseJourney}
      </div>
    </div>
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
