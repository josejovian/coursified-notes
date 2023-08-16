import { useMemo } from "react";
import { CourseJourney, Paragraph } from "@/src/components";
import { CourseType } from "@/src/type";
import { useProgress, useScreen } from "@/src/hooks";
import { readAllCourses, getDetailedCourse } from "@/src/lib/mdx";
import Image from "next/image";
import clsx from "clsx";
import Link from "next/link";
import { Icon } from "@/src/components/Basic/Icon";
import { BsChevronRight } from "react-icons/bs";
import { MdChevronRight } from "react-icons/md";

interface CourseProps {
  details: string;
}

const Course = ({ details }: CourseProps) => {
  const course = useMemo<CourseType>(() => JSON.parse(details), [details]);

  const { id, title, description, sections = [] } = course;

  const { width } = useScreen();

  const mainContentWidth = useMemo(() => {
    if (width >= 1280) return "1024px";
    if (width >= 800) return "720px";
    return "calc(100% - 4rem)";
  }, [width]);

  const { sectionData } = useProgress({ id, sections });

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
            width: mainContentWidth,
            left: "50%",
            transform: `translate(-50%, 0%)`,
          }}
        >
          <span className="flex gap-2">
            <Link href="/course/" legacyBehavior>
              <a>
                <Paragraph weight="bold" color="primary-2">
                  Courses
                </Paragraph>
              </a>
            </Link>
            <Icon className="text-secondary-1" IconComponent={MdChevronRight} />
            <Paragraph color="secondary-1" as="span">
              {title}
            </Paragraph>
          </span>
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
          width={width}
          height="320"
          className="absolute top-0 left-0 object-none object-center opacity-20"
          alt="Course Banner"
        />
      </header>
    ),
    [description, mainContentWidth, title, width]
  );

  return (
    <main>
      {renderCourseBanner}
      <article className="mx-auto py-16" style={{ width: mainContentWidth }}>
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
