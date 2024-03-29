import { useMemo, useEffect } from "react";
import Image from "next/image";
import clsx from "clsx";
import { MdChevronRight } from "react-icons/md";
import Link from "next/link";
import { Icon, Paragraph } from "@/components";
import { useProgress, useScreen } from "@/hooks";
import { CourseType } from "@/types";
import { CourseJourney } from "../components/CourseJourney";

interface CourseProps {
  details: string;
}

export function CourseDetailPage({ details }: CourseProps) {
  const course = useMemo<CourseType>(() => JSON.parse(details), [details]);

  const { id, title, description, sections = [] } = course;

  const { width } = useScreen();

  const mainContentWidth = useMemo(() => {
    if (width >= 1280) return "1024px";
    if (width >= 800) return "720px";
    return "calc(100% - 4rem)";
  }, [width]);

  const { sectionData } = useProgress({ id, sections });

  const courseDetailWithProgress: CourseType = useMemo(
    () => ({
      ...course,
      sections: sectionData,
    }),
    [course, sectionData]
  );

  const renderCourseJourney = useMemo(
    () => <CourseJourney course={courseDetailWithProgress} />,
    [courseDetailWithProgress]
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
            <Link href="/" legacyBehavior>
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
}
