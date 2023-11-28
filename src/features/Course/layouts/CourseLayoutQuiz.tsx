import {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import clsx from "clsx";
import { Button } from "@/components";
import { useQuiz, useToast } from "@/hooks";
import { getQuizAnswerSheet, storeQuizAnswerSheet } from "@/utils";
import {
  AddressesType,
  AnswerType,
  ChapterAddressType,
  CourseType,
  QuizAnswerSheetType,
  QuizAnswerType,
  QuizPhaseType,
  QuizQuestionType,
  StateType,
} from "@/type";
import { CourseQuizOnboarding } from "../components/CourseQuiz/CourseQuizOnboarding";
import { CourseLayoutMain } from "./CourseLayoutMain";
import { CourseLayoutQuizSide } from "./CourseLayoutQuizSide";
import { CourseLayoutTemplate } from "./CourseLayoutTemplate";

export function CourseLayoutQuiz({
  addreses,
  answerRef,
  acceptRef,
  mountedRef,
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
  handleCheckAnswer,
}: {
  addreses: AddressesType;
  chapterContent: string;
  stateSolved: StateType<number>;
  answerRef: MutableRefObject<Partial<AnswerType>>;
  acceptRef: MutableRefObject<AnswerType>;
  mountedRef: MutableRefObject<Record<string, boolean>>;
  stateLoading: StateType<boolean>;
  stateChecking: StateType<boolean>;
  stateSubmitted: StateType<boolean>;
  stateSwapChapters: StateType<boolean>;
  stateQuizPhase: StateType<QuizPhaseType>;
  statePage: StateType<number>;
  stateProblemCount: StateType<number>;
  stateLastUpdate: StateType<number>;
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
  const { quizAnswerSheetRef, quizDetails } = useQuiz({
    chapterAddress,
    courseDetail,
    answer,
    accept,
  });
  const quizQuestionsRef = useRef<Record<string, QuizQuestionType>>({});
  const quizAnswerSheet = quizAnswerSheetRef.current;
  const stateQuizPhase = useState<QuizPhaseType>();
  const [quizPhase, setQuizPhase] = stateQuizPhase;
  const setLoading = stateLoading[1];
  const setPage = statePage[1];

  const { addToast } = useToast();

  const handleUpdateSummary = useCallback(
    (ans: Partial<AnswerType>) => {
      const individualQuestions = Object.entries(
        quizAnswerSheetRef.current.questions
      )
        .map(([key, value]) => {
          let answered = true;
          let correct = true;

          const relatedInputs = value.inputIds.reduce((prev, curr) => {
            if (!ans[curr]) answered = false;
            if (!ans[curr] || ans[curr] !== acceptRef.current[curr])
              correct = false;

            return {
              ...prev,
              [curr]: ans[curr],
            };
          }, {});
          const relatedKeys = value.inputIds.reduce((prev, curr) => {
            return {
              ...prev,
              [curr]: acceptRef.current[curr],
            };
          }, {});

          return [
            key,
            {
              ...value,
              answers: relatedInputs,
              accept: relatedKeys,
              answered,
              correct,
              points: correct ? value.weight : 0,
            } as QuizAnswerType,
          ];
        })
        .reduce(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (prev, [key, value]: any) => ({
            ...prev,
            [key]: value,
          }),
          {}
        );

      // quizQuestionsRef.current = individualQuestions;
      return individualQuestions;
    },
    [acceptRef, quizAnswerSheetRef]
  );

  const handleSubmitQuiz = useCallback(() => {
    const now = new Date().getTime();
    const points = Object.values(quizAnswerSheetRef.current.summary).reduce(
      (prev, { points = 0 }) => prev + points,
      0
    );
    setQuizPhase("submitted");

    const finalAnswerSheet: QuizAnswerSheetType = {
      ...quizAnswerSheetRef.current,
      submittedAt: now,
      points,
      answers: answerRef.current,
    };
    storeQuizAnswerSheet(chapterAddress, finalAnswerSheet);
    quizAnswerSheetRef.current = finalAnswerSheet;
  }, [answerRef, chapterAddress, quizAnswerSheetRef, setQuizPhase]);

  const handleUpdateAnswer = useCallback(
    (ans: Partial<AnswerType>) => {
      const summary = handleUpdateSummary(ans);

      const finalAnswerSheet: QuizAnswerSheetType = {
        ...quizAnswerSheet,
        answers: {
          ...quizAnswerSheet.answers,
          ...ans,
        },
        summary,
      };

      quizAnswerSheetRef.current = finalAnswerSheet;

      if (quizAnswerSheet.submittedAt) return;
      if (quizAnswerSheet.startAt) {
        storeQuizAnswerSheet(chapterAddress, finalAnswerSheet);
      }
    },
    [chapterAddress, handleUpdateSummary, quizAnswerSheet, quizAnswerSheetRef]
  );

  const handleSetupQuiz = useCallback(() => {
    if (quizDetails && !quizPhase) {
      const existing = getQuizAnswerSheet(chapterAddress);
      const exists = existing && Object.keys(existing).length;

      if (exists && existing.submittedAt) {
        quizAnswerSheetRef.current = existing;
        setSubmitted(true);
        answerRef.current = existing.answers;
      } else if (exists && !existing.submittedAt) {
        quizAnswerSheetRef.current = existing;
        answerRef.current = existing.answers;
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
    quizAnswerSheetRef,
    quizDetails,
    quizPhase,
    setLoading,
    setQuizPhase,
    setSubmitted,
    setSwapChapters,
  ]);

  useEffect(() => {
    handleSetupQuiz();
  }, [quizDetails, handleSetupQuiz]);

  const renderPageContents = useMemo(
    () =>
      (!quizPhase || quizPhase === "onboarding") && quizDetails ? (
        <CourseQuizOnboarding
          chapterAddress={chapterAddress}
          quizDetails={quizDetails}
          trueLoading={trueLoading}
        />
      ) : (
        <CourseLayoutMain
          addreses={addreses}
          markdown={chapterContent}
          acceptRef={acceptRef}
          answerRef={answerRef}
          mountedRef={mountedRef}
          stateLoading={stateLoading}
          trueLoading={trueLoading}
          stateSolved={stateSolved}
          stateSubmitted={stateSubmitted}
          stateChecking={stateChecking}
          statePage={statePage}
          handleCheckAnswer={handleCheckAnswer}
          onChapterChange={() => setPage(0)}
          onAnswerUpdate={handleUpdateAnswer}
          onQuestionMount={(id, question) => {
            quizAnswerSheetRef.current.questions[id] = question;
          }}
          onOptionsMount={(id, answer) => {
            quizAnswerSheetRef.current.answers[id] = answer;
          }}
          inputIsDisabled={quizPhase !== "working"}
        />
      ),
    [
      quizPhase,
      quizDetails,
      chapterAddress,
      trueLoading,
      addreses,
      chapterContent,
      acceptRef,
      answerRef,
      mountedRef,
      stateLoading,
      stateSolved,
      stateSubmitted,
      stateChecking,
      statePage,
      handleCheckAnswer,
      handleUpdateAnswer,
      setPage,
      quizAnswerSheetRef,
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
                return;
              }

              const now = new Date();
              const end = new Date();
              if (quizDetails)
                end.setMinutes(end.getMinutes() + quizDetails.duration);

              if (!submitted) {
                setQuizPhase("working");
                quizAnswerSheetRef.current.startAt = now.getTime();
                quizAnswerSheetRef.current.endAt = end.getTime();
              } else {
                setQuizPhase("submitted");
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
      quizAnswerSheetRef,
      quizDetails,
      quizPhase,
      setQuizPhase,
      submitted,
      trueLoading,
    ]
  );

  return (
    <CourseLayoutTemplate
      trueLoading={trueLoading}
      sideElement={
        <CourseLayoutQuizSide
          chapterAddress={chapterAddress}
          courseDetail={courseDetailWithProgress}
          onQuizNoTimeLeft={() => {
            addToast({
              phrase: "courseQuizForceSubmit",
            });
            handleSubmitQuiz();
          }}
          quizAnswerSheetRef={quizAnswerSheetRef}
          sideHeaderImage={{
            src: "/calculus.jpg",
          }}
          stateQuizPhase={stateQuizPhase}
          quizDetails={quizDetails}
          quizQuestions={quizQuestionsRef}
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
    </CourseLayoutTemplate>
  );
}
