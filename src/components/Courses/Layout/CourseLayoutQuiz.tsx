import {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
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
  answerRef,
  acceptRef,
  chapterContent,
  stateChecking,
  stateLoading,
  stateSolved,
  stateSubmitted,
  stateSwapChapters,
  statePage,
  courseDetail,
  courseDetailWithProgress,
  chapterAddress,
  trueLoading,
  // quizDetails,
  // quizQuestions,
  // stateQuizAnswerSheet,
  // stateQuizPhase,
  handleCheckAnswer,
}: {
  addreses: AddressesType;
  chapterContent: any;
  stateSolved: StateType<number>;
  answerRef: MutableRefObject<Partial<AnswerType>>;
  acceptRef: MutableRefObject<AnswerType>;
  stateLoading: StateType<boolean>;
  stateChecking: StateType<boolean>;
  stateSubmitted: StateType<boolean>;
  stateSwapChapters: StateType<boolean>;
  stateQuizPhase: StateType<QuizPhaseType>;
  statePage: StateType<number>;
  // stateQuizAnswerSheet: StateType<QuizAnswerSheetType>;
  // quizQuestions: MutableRefObject<Record<string, QuizQuestionType>>;
  // quizDetails: QuizConfigType;
  courseDetail: CourseType;
  courseDetailWithProgress: CourseType;
  chapterAddress: ChapterAddressType;
  trueLoading: boolean;
  handleCheckAnswer: (
    userAnswer: string,
    practiceId: string,
    updateCheckingState?: boolean
  ) => boolean;
}) {
  const answer = answerRef.current;
  const accept = acceptRef.current;

  const [submitted, setSubmitted] = stateSubmitted;
  const setSwapChapters = stateSwapChapters[1];
  const { stateQuizAnswerSheet, quizDetails, quizQuestions } = useQuiz({
    chapterAddress,
    courseDetail,
    answer,
    accept,
  });
  const [quizPhase, setQuizPhase] = useState<QuizPhaseType>();
  const [quizAnswerSheet, setQuizAnswerSheet] = stateQuizAnswerSheet;
  const { endAt } = quizAnswerSheet;
  const [loading, setLoading] = stateLoading;
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

    if (quizAnswerSheet.submittedAt) return;

    if (quizAnswerSheet.startAt) {
      storeQuizAnswerSheet(chapterAddress, finalAnswerSheet);
    }
  }, [answer, chapterAddress, quizAnswerSheet]);

  const handleSetupQuiz = useCallback(() => {
    if (quizDetails && !quizPhase) {
      const existing = getQuizAnswerSheet(chapterAddress);
      console.log(existing?.submittedAt);

      const exists = existing && Object.keys(existing).length;

      if (exists && existing.submittedAt) {
        setQuizAnswerSheet(existing);
        setSubmitted(true);
        answerRef.current = existing.answers as any;
      } else if (exists && !existing.submittedAt) {
        setQuizAnswerSheet(existing);
        answerRef.current = existing.answers as any;
        addToast({
          phrase: "courseQuizContinueFromBackUp",
        });
      }

      setQuizPhase("onboarding");
      setLoading(false);
      setSwapChapters(false);
    }
  }, [
    addToast,
    answerRef,
    chapterAddress,
    quizDetails,
    quizPhase,
    setLoading,
    setQuizAnswerSheet,
    setSubmitted,
    setSwapChapters,
  ]);

  useEffect(() => {
    console.log("Rerender: ", submitted);
  }, [submitted]);

  useEffect(() => {
    handleSetupQuiz();
  }, [quizDetails, handleSetupQuiz]);

  useEffect(() => {
    handleBackupQuizBeforeSubmit();
  }, [answer, handleBackupQuizBeforeSubmit]);

  const renderPageContents = useMemo(
    () =>
      (!quizPhase || quizPhase === "onboarding") && quizDetails ? (
        <CourseQuizOnboarding
          quizDetails={quizDetails}
          trueLoading={trueLoading}
        />
      ) : (
        <CourseLayoutMain
          addreses={addreses}
          markdown={chapterContent}
          acceptRef={acceptRef}
          answerRef={answerRef}
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
      acceptRef,
      answerRef,
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
      !quizPhase || quizPhase === "onboarding" ? (
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
                console.log("Viewing Finished Quiz");
                setQuizPhase("submitted");
                setLoading(true);
              }
            }}
            disabled={trueLoading}
          >
            {(() => {
              if (quizAnswerSheet.submittedAt) return "View";
              if (quizAnswerSheet.startAt && !quizAnswerSheet.submittedAt)
                return "Resume";
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
      trueLoading={trueLoading}
      sideHeaderImage={{
        src: "/calculus.jpg",
      }}
      sideHeaderElement={
        quizDetails && (
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
