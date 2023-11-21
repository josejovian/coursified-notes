/* eslint-disable react/jsx-no-undef */
import Image, { ImageProps } from "next/image";
import {
  useRef,
  useMemo,
  useState,
  useEffect,
  MutableRefObject,
  useCallback,
} from "react";
import { Badge, IconText, Paragraph } from "../../Basic";
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
import { getPercentGroup, getQuizAnswerSheet } from "@/src/utils";

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
  const [percent, setPercent] = useState<number>();
  const [quizPhase, setQuizPhase] = stateQuizPhase;
  const stateLeft = useState(0);

  const handleGetPercent = useCallback(() => {
    const answerSheet = getQuizAnswerSheet(chapterAddress);

    if (!answerSheet) return;

    const maxAchievable = Object.values(answerSheet.questions).reduce(
      (prev, curr) => {
        return prev + curr.weight;
      },
      0
    );

    const achieved = answerSheet.points ?? 0;

    setPercent(Math.ceil((achieved * 100) / maxAchievable));
  }, [chapterAddress]);

  useEffect(() => {
    handleGetPercent();
  }, [handleGetPercent]);

  return (
    <>
      <CourseLayoutSideHeader sideHeaderImage={sideHeaderImage}>
        {quizDetails && (
          <>
            {quizPhase === "submitted" && (
              <Paragraph
                onClick={() => {
                  setQuizPhase("onboarding");
                }}
                color="secondary-1"
                className="cursor-pointer"
              >
                Back to Course
              </Paragraph>
            )}

            <div className="flex flex-row flex-wrap items-center gap-4">
              <Paragraph as="h2" size="l" weight="bold" color="secondary-1">
                Quiz - {quizDetails.title}
              </Paragraph>
              {!!percent && quizDetails && quizPhase === "submitted" && (
                <Badge color={getPercentGroup(percent)} inverted>
                  {percent}%
                </Badge>
              )}
            </div>
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
