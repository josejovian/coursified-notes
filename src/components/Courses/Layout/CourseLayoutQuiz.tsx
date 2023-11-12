import { MutableRefObject, useCallback, useEffect, useMemo } from "react";
import {
  AddressesType,
  AnswerType,
  ChapterAddressType,
  CourseType,
  QuizAnswerSheetType,
  QuizConfigType,
  QuizPhaseType,
  QuizQuestionType,
  StateType,
} from "@/src/type";
import { TemplateGeneric } from "../../Template";
import { Button, IconText, Paragraph } from "../../Basic";
import { useRouter } from "next/router";
import { BsFillClockFill } from "react-icons/bs";
import { CourseQuizTimer } from "../Quiz/CourseQuizTimer";
import { useQuiz, useToast } from "@/src/hooks";
import { CourseLayoutSide } from "./CourseLayoutSide";
import clsx from "clsx";
import { CourseQuizOnboarding } from "../Quiz";
import { CourseLayoutMain } from "./CourseLayoutMain";
import { getQuizAnswerSheet, storeQuizAnswerSheet } from "@/src/utils";

export function CourseLayoutQuiz({
  addreses,
  chapterContent,
  stateAccept,
  stateAnswer,
  stateChecking,
  stateLoading,
  stateSolved,
  stateSubmitted,
  stateSwapChapters,
  statePage,
  courseDetailWithProgress,
  chapterAddress,
  trueLoading,
  handleCheckAnswer,
}: {
  addreses: AddressesType;
  chapterContent: any;
  stateSolved: StateType<number>;
  stateAnswer: StateType<Partial<AnswerType>>;
  stateAccept: StateType<AnswerType>;
  stateLoading: StateType<boolean>;
  stateChecking: StateType<boolean>;
  stateSubmitted: StateType<boolean>;
  stateSwapChapters: StateType<boolean>;
  statePage: StateType<number>;
  courseDetailWithProgress: CourseType;
  chapterAddress: ChapterAddressType;
  trueLoading: boolean;
  handleCheckAnswer: (
    userAnswer: string,
    practiceId: string,
    updateCheckingState?: boolean
  ) => boolean;
}) {
  const [answer, setAnswer] = stateAnswer;
  const [submitted, setSubmitted] = stateSubmitted;
  const setSwapChapters = stateSwapChapters[1];
  const accept = stateAccept[0];
  const { stateQuizAnswerSheet, quizDetails, quizQuestions, stateQuizPhase } =
    useQuiz({
      chapterAddress,
      courseDetail: courseDetailWithProgress,
      answer,
      accept,
    });
  const [quizPhase, setQuizPhase] = stateQuizPhase;
  const [quizAnswerSheet, setQuizAnswerSheet] = stateQuizAnswerSheet;
  const { endAt } = quizAnswerSheet;
  const setLoading = stateLoading[1];
  const setPage = statePage[1];

  const { addToast } = useToast();
  const router = useRouter();

  const handleSubmitQuiz = useCallback(() => {
    const now = new Date().getTime();
    const points = Object.values(quizAnswerSheet.answers).reduce(
      (prev, { points = 0 }) => prev + points,
      0
    );
    setSubmitted(true);
    setQuizPhase("submitted");
    setQuizAnswerSheet((prev) => {
      const finalAnswerSheet: QuizAnswerSheetType = {
        ...prev,
        submittedAt: now,
        points,
        answers: answer as any,
      };

      storeQuizAnswerSheet(chapterAddress, finalAnswerSheet);

      return finalAnswerSheet;
    });
  }, [
    answer,
    chapterAddress,
    quizAnswerSheet.answers,
    setQuizAnswerSheet,
    setQuizPhase,
    setSubmitted,
  ]);

  const handleBackupQuizBeforeSubmit = useCallback(() => {
    const finalAnswerSheet: QuizAnswerSheetType = {
      ...quizAnswerSheet,
      answers: answer as any,
    };

    console.log("Quiz Answer Sheet: ", quizAnswerSheet);

    if (quizAnswerSheet.submittedAt) return;

    if (quizAnswerSheet.startAt) {
      storeQuizAnswerSheet(chapterAddress, finalAnswerSheet);
    }
  }, [answer, chapterAddress, quizAnswerSheet]);

  const handleSetupQuiz = useCallback(() => {
    if (quizDetails && !quizPhase) {
      const existing = getQuizAnswerSheet(chapterAddress);

      if (existing && Object.keys(existing).length && !existing.submittedAt) {
        setQuizAnswerSheet(existing);
        setAnswer(existing.answers as any);
        addToast({
          phrase: "courseQuizContinueFromBackUp",
        });
      } else if (!submitted && existing && Object.keys(existing).length) {
        setQuizAnswerSheet(existing);
        setSubmitted(true);
        setAnswer(existing.answers as any);
      }

      setQuizPhase("onboarding");
      setLoading(false);
      setSwapChapters(false);
    }
  }, [
    addToast,
    chapterAddress,
    quizDetails,
    quizPhase,
    setAnswer,
    setLoading,
    setQuizAnswerSheet,
    setQuizPhase,
    setSubmitted,
    setSwapChapters,
    submitted,
  ]);

  useEffect(() => {
    handleSetupQuiz();
  }, [quizDetails, handleSetupQuiz]);
  useEffect(() => {
    handleBackupQuizBeforeSubmit();
  }, [answer, handleBackupQuizBeforeSubmit]);

  const renderPageContents = useMemo(
    () =>
      quizPhase === "onboarding" && quizDetails ? (
        <CourseQuizOnboarding
          quizDetails={quizDetails}
          trueLoading={trueLoading}
        />
      ) : (
        <CourseLayoutMain
          addreses={addreses}
          markdown={chapterContent}
          stateAccept={stateAccept}
          stateAnswer={stateAnswer}
          stateLoading={stateLoading}
          trueLoading={trueLoading}
          stateSolved={stateSolved}
          stateSubmitted={stateSubmitted}
          stateChecking={stateChecking}
          statePage={statePage}
          handleCheckAnswer={handleCheckAnswer}
          onChapterChange={() => setPage(0)}
          quizQuestions={quizQuestions}
          inputIsDisabled={quizPhase !== "working"}
        />
      ),
    [
      quizPhase,
      quizDetails,
      trueLoading,
      addreses,
      chapterContent,
      stateAccept,
      stateAnswer,
      stateLoading,
      stateSolved,
      stateSubmitted,
      stateChecking,
      statePage,
      handleCheckAnswer,
      quizQuestions,
      setPage,
    ]
  );
  const renderQuizControls = useMemo(
    () =>
      quizPhase === "onboarding" ? (
        <>
          <Button
            size="l"
            onClick={() => {
              if (
                quizAnswerSheet &&
                quizAnswerSheet.startAt &&
                !quizAnswerSheet.submittedAt
              ) {
                setQuizPhase("working");
                setLoading(true);
                return;
              }

              const now = new Date();
              const end = new Date();
              if (quizDetails)
                end.setMinutes(end.getMinutes() + quizDetails.duration);

              if (!submitted) {
                setQuizPhase("working");
                setLoading(true);
                setQuizAnswerSheet((prev) => ({
                  ...prev,
                  startAt: now.getTime(),
                  endAt: end.getTime(),
                }));
              } else {
                setQuizPhase("submitted");
                setLoading(true);
              }
            }}
            disabled={trueLoading}
          >
            {(() => {
              if (submitted) return "View";
              if (quizAnswerSheet.startAt) return "Resume";
              return "Start";
            })()}
          </Button>
          {/* <Button
            onClick={() => {
              storeChapterProgress(chapterAddress, undefined);
            }}
          >
            Clear
          </Button> */}
        </>
      ) : (
        <>
          <Button
            size="l"
            onClick={handleSubmitQuiz}
            disabled={
              // Object.values(answer).length !== Object.values(accept).length
              submitted
            }
          >
            Submit
          </Button>
        </>
      ),
    [
      handleSubmitQuiz,
      quizAnswerSheet,
      quizDetails,
      quizPhase,
      setLoading,
      setQuizAnswerSheet,
      setQuizPhase,
      submitted,
      trueLoading,
    ]
  );

  return (
    <TemplateGeneric
      sideHeaderImage={{
        src: "/calculus.jpg",
      }}
      sideHeaderElement={
        quizDetails && (
          <>
            {quizPhase === "submitted" && (
              <Paragraph
                onClick={() => {
                  router.back();
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
            {!quizAnswerSheet.submittedAt && (
              <IconText icon={BsFillClockFill} color="secondary-1">
                <CourseQuizTimer
                  onQuizNoTimeLeft={() => {
                    addToast({
                      phrase: "courseQuizForceSubmit",
                    });
                    handleSubmitQuiz();
                  }}
                  endAt={quizAnswerSheet?.endAt}
                  isStopped={!!quizAnswerSheet?.submittedAt}
                />
              </IconText>
            )}
          </>
        )
      }
      sideElement={
        <CourseLayoutSide
          quizPhase={quizPhase}
          onQuizBack={() => {
            router.back();
          }}
          onQuizNoTimeLeft={() => {
            addToast({
              phrase: "courseQuizForceSubmit",
            });
            handleSubmitQuiz();
          }}
          quizDetails={quizPhase !== "onboarding" ? quizDetails : undefined}
          quizAnswerSheet={quizAnswerSheet}
          quizQuestions={quizQuestions}
          courseDetail={courseDetailWithProgress}
          chapterAddress={chapterAddress}
          trueLoading={trueLoading}
        />
      }
    >
      {renderPageContents}
      <div
        className={clsx(
          "flex justify-center items-center p-8",
          "gap-8 w-full bg-gray-100",
          "border-t border-zinc-400"
        )}
      >
        {renderQuizControls}
      </div>
    </TemplateGeneric>
  );
}
