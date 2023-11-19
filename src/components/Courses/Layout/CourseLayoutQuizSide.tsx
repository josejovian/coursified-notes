/* eslint-disable react/jsx-no-undef */
import Image, { ImageProps } from "next/image";
import { useRef, useMemo, useState, useEffect, MutableRefObject } from "react";
import { IconText, Paragraph } from "../../Basic";
import { BsFillClockFill } from "react-icons/bs";
import {
  ChapterAddressType,
  CourseType,
  QuizAnswerSheetType,
  QuizConfigType,
  QuizPhaseType,
  QuizQuestionType,
  StateType,
} from "@/src/type";
import { CourseQuizTimer } from "../Quiz/CourseQuizTimer";
import { useToast } from "@/src/hooks";
import { CourseLayoutSideHeader } from "./CourseLayoutSideHeader";
import { CourseLayoutSide } from "./CourseLayoutSide";

export function CourseLayoutQuizSide({
  sideHeaderImage,
  stateQuizPhase,
  quizDetails,
  quizAnswerSheetRef,
  chapterAddress,
  courseDetail,
  quizQuestions,
  trueLoading,
  onQuizNoTimeLeft,
}: {
  sideHeaderImage: ImageProps;
  stateQuizPhase: StateType<QuizPhaseType>;
  quizAnswerSheetRef: MutableRefObject<QuizAnswerSheetType>;
  quizDetails?: QuizConfigType;
  courseDetail: CourseType;
  chapterAddress: ChapterAddressType;
  quizQuestions?: MutableRefObject<Record<string, QuizQuestionType>>;
  trueLoading?: boolean;
  onQuizNoTimeLeft: () => void;
}) {
  const headerWrapperRef = useRef<HTMLDivElement>(null);
  const textWrapperRef = useRef<HTMLDivElement>(null);
  const [quizPhase, setQuizPhase] = stateQuizPhase;
  const stateLeft = useState(0);
  const [left, setLeft] = stateLeft;
  const { addToast } = useToast();

  const renderHeader = useMemo(
    () => (
      <CourseLayoutSideHeader sideHeaderImage={sideHeaderImage}>
        {quizDetails && (
          <>
            {quizPhase === "submitted" && (
              <Paragraph
                onClick={() => {
                  setQuizPhase("onboarding");
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
            {!quizAnswerSheetRef.current.submittedAt && (
              <IconText icon={BsFillClockFill} color="secondary-1">
                <CourseQuizTimer
                  stateLeft={stateLeft}
                  onQuizNoTimeLeft={onQuizNoTimeLeft}
                  endAt={quizAnswerSheetRef.current.endAt}
                  isStopped={!!quizAnswerSheetRef.current.submittedAt}
                />
              </IconText>
            )}
          </>
        )}
      </CourseLayoutSideHeader>
    ),
    [
      onQuizNoTimeLeft,
      quizAnswerSheetRef,
      quizDetails,
      quizPhase,
      setQuizPhase,
      sideHeaderImage,
      stateLeft,
    ]
  );

  const renderBody = useMemo(
    () => (
      <CourseLayoutSide
        quizPhase={quizPhase}
        quizDetails={quizPhase !== "onboarding" ? quizDetails : undefined}
        quizAnswerSheetRef={quizAnswerSheetRef}
        quizQuestions={quizQuestions}
        courseDetail={courseDetail}
        chapterAddress={chapterAddress}
        trueLoading={trueLoading}
      />
    ),
    [
      chapterAddress,
      courseDetail,
      quizAnswerSheetRef,
      quizDetails,
      quizPhase,
      quizQuestions,
      trueLoading,
    ]
  );

  return (
    <>
      {" "}
      <CourseLayoutSideHeader sideHeaderImage={sideHeaderImage}>
        {quizDetails && (
          <>
            {quizPhase === "submitted" && (
              <Paragraph
                onClick={() => {
                  setQuizPhase("onboarding");
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
            {!quizAnswerSheetRef.current.submittedAt && (
              <IconText icon={BsFillClockFill} color="secondary-1">
                <CourseQuizTimer
                  stateLeft={stateLeft}
                  onQuizNoTimeLeft={onQuizNoTimeLeft}
                  endAt={quizAnswerSheetRef.current.endAt}
                  isStopped={!!quizAnswerSheetRef.current.submittedAt}
                />
              </IconText>
            )}
          </>
        )}
      </CourseLayoutSideHeader>
      <CourseLayoutSide
        quizPhase={quizPhase}
        quizDetails={quizPhase !== "onboarding" ? quizDetails : undefined}
        quizAnswerSheetRef={quizAnswerSheetRef}
        quizQuestions={quizQuestions}
        courseDetail={courseDetail}
        chapterAddress={chapterAddress}
        trueLoading={trueLoading}
      />
    </>
  );
}
