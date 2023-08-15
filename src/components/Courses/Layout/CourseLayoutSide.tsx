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
import { Badge, Button, CourseJourney, Paragraph } from "@/src/components";
import { checkCourseProgress } from "@/src/utils";
import { useProgress, useScreen } from "@/src/hooks";
import { getLastFinishedChapter } from "@/src/utils/materials";
import Image from "next/image";
import { Icon } from "../../Basic/Icon";
import { MdChevronLeft } from "react-icons/md";

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
  const { width } = useScreen();
  const [open, setOpen] = useState(false);

  const { id, title, sections, description } = courseDetail;

  const sectionData = useProgress({ id, sections });

  useEffect(() => {
    if (headerWrapperRef.current && textWrapperRef.current) {
      headerWrapperRef.current.style.height = `${textWrapperRef.current.offsetHeight}px`;
    }
  });

  useEffect(() => {
    if (width < 1024) setOpen(false);
  }, [width]);

  const renderCourseHeader = useMemo(
    () => (
      <div ref={headerWrapperRef} className="flex relative bg-black">
        <div
          ref={textWrapperRef}
          className="absolute top-0 p-8 flex flex-col gap-4 z-10"
        >
          <Paragraph as="h2" size="l" weight="bold" color="secondary-1">
            {title}
          </Paragraph>
          <Paragraph as="p" color="secondary-1">
            {description}
          </Paragraph>
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
    ),
    [description, title]
  );

  const renderCourseContents = useMemo(
    () => (
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
    ),
    [chapterAddress, courseDetail, sectionData]
  );

  const renderSideToggleButton = useMemo(
    () => (
      <>
        {/* <div
        tabIndex={0}
        role="button"
        className={clsx(
          "w-10 h-10 fixed left-4 top-4",
          "flex items-center justify-center",
          "transition-all cursor-pointer shadow-lg z-20",
          open
            ? "translate-x-60 text-zinc-700 bg-gray-50 hover:bg-gray-200"
            : "text-white bg-zinc-700 hover:bg-zinc-600",
          width >= 1024 && "hidden"
        )}
        onClick={() => setOpen((prev) => !prev)}
				>
					<Icon
						className={clsx(!open && "rotate-180")}
						size="l"
						IconComponent={MdChevronLeft}
					/>
					</div> */}
        <Button
          className={clsx(
            "fixed top-6",
            "cursor-pointer shadow-lg z-20 transition-transform",
            open ? "translate-x-64" : "translate-x-6",
            width >= 1024 && "hidden"
          )}
          onClick={() => setOpen((prev) => !prev)}
          color={open ? "tertiary" : "secondary"}
          icon
        >
          <Icon
            className={clsx(!open && "rotate-180")}
            size="l"
            IconComponent={MdChevronLeft}
          />
        </Button>
      </>
    ),
    [open, width]
  );

  return (
    <>
      <aside
        id="CourseMaterial_side"
        className={clsx(
          "border-r border-zinc-400 flex flex-col flex-grow overflow-hidden h-full bg-white z-10",
          width >= 1024
            ? "translate-x-0 !duration-0"
            : [
                open
                  ? " absolute left-0 top-0 "
                  : "absolute left-0 top-0 -translate-x-full",
              ],
          width < 1024 && "transition-all"
        )}
      >
        {renderCourseHeader}
        <hr />
        {renderCourseContents}
      </aside>
      {renderSideToggleButton}
    </>
  );
}
