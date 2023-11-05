import { useState, useEffect, useMemo, useRef, MutableRefObject } from "react";
import {
  ChapterAddressType,
  CourseType,
  QuizAnswerSheetType,
  QuizAnswerType,
  QuizConfigType,
  QuizPhaseType,
  QuizQuestionType,
} from "@/src/type";
import clsx from "clsx";
import Link from "next/link";
import {
  Button,
  CourseJourney,
  Paragraph,
  Icon,
  CourseQuizList,
  IconText,
} from "@/src/components";
import { useScreen } from "@/src/hooks";
import Image from "next/image";
import { MdChevronLeft } from "react-icons/md";
import { getHMS } from "@/src/utils/date";
import { CourseQuizTimer } from "../Quiz/CourseQuizTimer";
import { BsFillClockFill } from "react-icons/bs";

interface SideProps {
  courseDetail: CourseType;
  chapterAddress: ChapterAddressType;
  quizDetails?: QuizConfigType;
  quizAnswerSheet?: QuizAnswerSheetType;
  quizQuestions?: MutableRefObject<Record<string, QuizQuestionType>>;
  quizPhase?: QuizPhaseType;
  trueLoading?: boolean;
  onQuizBack?: () => void;
  onQuizNoTimeLeft?: () => void;
}

export function CourseLayoutSide({
  courseDetail,
  chapterAddress,
  quizQuestions,
  quizDetails,
  quizAnswerSheet,
  quizPhase,
  trueLoading,
  onQuizBack,
  onQuizNoTimeLeft,
}: SideProps) {
  const headerWrapperRef = useRef<HTMLDivElement>(null);
  const textWrapperRef = useRef<HTMLDivElement>(null);
  const { width } = useScreen();
  const [open, setOpen] = useState(false);
  const [left, setLeft] = useState<number>();
  const showQuizQuestions =
    quizDetails &&
    quizQuestions &&
    quizAnswerSheet &&
    quizPhase !== "onboarding";

  const { id, title, description } = courseDetail;

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
            {!quizAnswerSheet?.submittedAt && (
              <IconText icon={BsFillClockFill} color="secondary-1">
                <CourseQuizTimer
                  onQuizNoTimeLeft={onQuizNoTimeLeft}
                  endAt={quizAnswerSheet?.endAt}
                  isStopped={!!quizAnswerSheet?.submittedAt}
                />
              </IconText>
            )}
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
    [
      description,
      id,
      onQuizBack,
      onQuizNoTimeLeft,
      quizAnswerSheet?.endAt,
      quizAnswerSheet?.submittedAt,
      quizDetails,
      quizPhase,
      title,
    ]
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
          {showQuizQuestions ? (
            <CourseQuizList
              questions={quizQuestions}
              quizPhase={quizPhase}
              quizAnswerSheet={quizAnswerSheet}
              onClickQuestion={(id) =>
                document.getElementById(`q${id}`)?.scrollIntoView()
              }
              disabled={trueLoading}
              noBorder
              noPadding
            />
          ) : (
            <CourseJourney
              course={courseDetail}
              chapterAddress={chapterAddress}
              disabled={trueLoading}
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
