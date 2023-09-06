import {
  Fragment,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  MutableRefObject,
} from "react";
import {
  AnswerType,
  ChapterAddressType,
  ChapterType,
  CourseType,
  QuizConfigType,
  QuizPhaseType,
  QuizQuestionType,
  RequirementMap,
  RequirementType,
  SectionType,
  StateType,
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
import { CourseQuizList } from "../Quiz/CourseQuizList";

interface SideProps {
  courseDetail: CourseType;
  chapterAddress: ChapterAddressType;
  quizDetails?: QuizConfigType;
  quizAnswerSheet: any;
  quizQuestions?: MutableRefObject<Record<string, QuizQuestionType>>;
  quizPhase?: QuizPhaseType;
  statePage: StateType<number>;
  trueLoading?: boolean;
  onQuizBack?: () => void;
}

export function CourseLayoutSide({
  courseDetail,
  chapterAddress,
  quizQuestions,
  quizDetails,
  statePage,
  quizAnswerSheet,
  quizPhase,
  onQuizBack,
  trueLoading,
}: SideProps) {
  const headerWrapperRef = useRef<HTMLDivElement>(null);
  const textWrapperRef = useRef<HTMLDivElement>(null);
  const { width } = useScreen();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const setPage = statePage[1];

  const { id, title, sections, description } = courseDetail;

  useEffect(() => {
    if (headerWrapperRef.current && textWrapperRef.current) {
      headerWrapperRef.current.style.height = `${textWrapperRef.current.offsetHeight}px`;
    }
  });

  useEffect(() => {
    if (width < 1024) setOpen(false);
  }, [width]);

  const renderCourseHeader = useMemo(
    () =>
      quizPhase !== "onboarding" && quizDetails ? (
        <div ref={headerWrapperRef} className="flex relative bg-black">
          <div
            ref={textWrapperRef}
            className="absolute top-0 p-8 flex flex-col gap-4 z-10"
          >
            {quizPhase === "submitted" && (
              <Paragraph
                onClick={() => {
                  onQuizBack && onQuizBack();
                }}
                color="secondary-1"
              >
                Back to Course
              </Paragraph>
            )}
            <Paragraph as="h2" size="l" weight="bold" color="secondary-1">
              Quiz - {quizDetails.title}
            </Paragraph>
            <Paragraph as="p" color="secondary-1">
              {quizDetails.description}
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
      ) : (
        <div ref={headerWrapperRef} className="flex relative bg-black">
          <div
            ref={textWrapperRef}
            className="absolute top-0 p-8 flex flex-col gap-4 z-10"
          >
            <Link href={`/${id}`} legacyBehavior>
              <a>
                <Paragraph as="h2" size="l" weight="bold" color="secondary-1">
                  {title}
                </Paragraph>
              </a>
            </Link>
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
    [description, id, onQuizBack, quizDetails, quizPhase, title]
  );

  const renderSideToggleButton = useMemo(
    () => (
      <>
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
        <div className="!h-full overflow-y-auto">
          {quizDetails &&
          quizQuestions &&
          quizAnswerSheet &&
          quizPhase !== "onboarding" ? (
            <CourseQuizList
              title={quizDetails.title}
              questions={quizQuestions}
              quizPhase={quizPhase}
              quizAnswerSheet={quizAnswerSheet}
              onClickQuestion={() => {
                router.push("");
              }}
              noBorder
              noPadding
            />
          ) : (
            <CourseJourney
              course={courseDetail}
              chapterAddress={chapterAddress}
              noBorder
              noPadding
            />
          )}
        </div>
      </aside>
      {renderSideToggleButton}
    </>
  );
}
