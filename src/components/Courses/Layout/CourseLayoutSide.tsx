import {
  Fragment,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  ChapterAddressType,
  ChapterType,
  CourseType,
  RequirementMap,
  RequirementType,
  SectionType,
} from "@/src/type";
import clsx from "clsx";
import { useRouter } from "next/router";
import Link from "next/link";
import { Badge, CourseJourney, Paragraph } from "@/src/components";
import { checkCourseProgress } from "@/src/utils";
import { useProgress } from "@/src/hooks";
import { getLastFinishedChapter } from "@/src/utils/materials";
import Image from "next/image";

interface SideProps {
  courseDetail: CourseType;
  chapterAddress: ChapterAddressType;
  trueLoading?: boolean;
}

export function CourseLayoutSide({
  courseDetail,
  chapterAddress,
  trueLoading,
}: SideProps) {
  const headerWrapperRef = useRef<HTMLDivElement>(null);
  const textWrapperRef = useRef<HTMLDivElement>(null);

  const { id, title, sections, description } = courseDetail;

  const sectionData = useProgress({ id, sections });

  const chapterIsActive = useCallback(
    (section: string, chapter: string) => {
      return (
        section === chapterAddress.section && chapter === chapterAddress.chapter
      );
    },
    [chapterAddress.chapter, chapterAddress.section]
  );

  const renderChapterEntry = useCallback(
    (
      idx1: number,
      idx2: number,
      name: string,
      status: string,
      active: boolean
    ) => {
      return (
        <div
          className={clsx("CourseMaterial_entry", [
            status === "completed" && [
              "border-r-4 border-r-green-200 hover:bg-success-2",
              active && "bg-success-1 hover:bg-success-2",
            ],
            status === "ongoing" && [
              "border-r-4 border-r-yellow-200 hover:bg-warning-2",
              active && "bg-warning-1 hover:bg-warning-2",
            ],
            status === "locked" && [
              "CourseMaterial_entry-locked bg-secondary-1",
            ],
          ])}
        >
          <div className="CourseMaterial_index">
            {idx1}.{idx2}
          </div>
          {name}
        </div>
      );
    },
    []
  );

  const renderSections = useMemo(
    () =>
      sectionData &&
      sectionData.map((section, idx1) => {
        idx1++;

        const _id = section.id ?? "";
        const _title = section.title;
        const chapters = section.chapters;
        const sectionId = `Side_section-${_id}`;
        const lastCompletedChapter = getLastFinishedChapter(chapters);

        return (
          <Fragment key={sectionId}>
            <div className="CourseMaterial_header CourseMaterial_entry">
              <>
                <div className="CourseMaterial_index">{idx1}</div>
                {_title}
              </>
              <Badge className="absolute right-8">
                <>
                  {lastCompletedChapter} / {chapters.length}
                </>
              </Badge>
            </div>
            {chapters.map((chapter, idx2) => {
              idx2++;

              const __id = chapter.id ?? "";
              const __title = chapter.title;
              const chapterId = `Side_section-${_id}-${__id}`;

              let status = "locked";
              if (lastCompletedChapter >= idx2) {
                status = "completed";
              } else if (lastCompletedChapter === idx2 - 1) {
                status = "ongoing";
              }

              const active = chapterIsActive(_id, __id);

              const entry = renderChapterEntry(
                idx1,
                idx2,
                __title,
                status,
                active
              );

              return lastCompletedChapter >= idx2 - 1 || idx2 === 0 ? (
                <Link
                  href={`/course/${id}/${_id}/${__id}`}
                  key={chapterId}
                  passHref
                >
                  <a>{entry}</a>
                </Link>
              ) : (
                <Fragment key={chapterId}>{entry}</Fragment>
              );
            })}
          </Fragment>
        );
      }),
    [sectionData, chapterIsActive, renderChapterEntry, id]
  );

  useEffect(() => {
    if (headerWrapperRef.current && textWrapperRef.current)
      headerWrapperRef.current.style.height = `${textWrapperRef.current.offsetHeight}px`;
  });

  return (
    <aside
      id="CourseMaterial_side"
      className="border-r border-zinc-400 flex flex-col flex-grow"
    >
      <div ref={headerWrapperRef} className="flex relative bg-black">
        <div
          ref={textWrapperRef}
          className="absolute top-0 p-8 flex flex-col gap-4 z-10"
        >
          <Paragraph as="h2" size="l" weight="bold" color="secondary-1">
            {title}
          </Paragraph>
          <Paragraph color="secondary-1">{description}</Paragraph>
          <Paragraph size="m-alt" color="secondary-1">
            Jose Jovian
          </Paragraph>
        </div>
        <Image
          src="/calculus.jpg"
          width="512"
          height="512"
          className="fixed top-0 left-0 object-none object-center opacity-20"
          alt="Course Banner"
        />
      </div>
      <hr />
      <div className="!h-full overflow-y-auto">
        <CourseJourney
          course={{
            ...courseDetail,
            sections: sectionData,
          }}
          chapterAddress={chapterAddress}
          noBorder
          noPadding
        />
      </div>
    </aside>
  );
}
