import { useMemo } from "react";
import { CourseJourney, Paragraph } from "@/src/components";
import { CourseType } from "@/src/type";
import { useProgress } from "@/src/hooks";
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
    () => (
      <CourseJourney
        course={{
          ...course,
          sections: sectionData,
        }}
      />
    ),
    [course, sectionData]
  );

  const renderCourseBanner = useMemo(
    () => (
      <header className="relative mx-auto w-full h-60 bg-black overflow-hidden">
        <div
          className={clsx(
            "absolute top-0 h-60",
            "flex flex-col justify-center gap-5",
            "mx-auto z-10"
          )}
          style={{
            width: "1024px",
            left: "50%",
            transform: `translate(-50%, 0%)`,
          }}
        >
          <Paragraph as="h1" size="xl" weight="bold" color="secondary-1">
            {title}
          </Paragraph>
          <Paragraph size="l-alt" color="secondary-1">
            {description}
          </Paragraph>
          <Paragraph size="m-alt" color="secondary-1">
            Jose Jovian
          </Paragraph>
        </div>
        <Image
          src="/calculus.jpg"
          width="1920"
          height="512"
          className="absolute top-0 left-0 object-none object-center opacity-20"
          alt="Course Banner"
        />
      </header>
    ),
    [description, title]
  );

  return (
    <main>
      {renderCourseBanner}
      <article className="mx-auto py-16" style={{ width: "1024px" }}>
        <Paragraph as="h2" size="l-alt" weight="bold" className="mb-8">
          Contents
        </Paragraph>
        {renderCourseJourney}
      </article>
    </main>
  );
};

export const getStaticPaths = async () => {
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

  const details = await getDetailedCourse(course);

  return {
    props: { details: JSON.stringify(details) },
  };
};

export default Course;
