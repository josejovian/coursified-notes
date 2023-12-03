import {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import clsx from "clsx";
import { Button } from "@/components";
import { useDebounce, useQuiz, useToast } from "@/hooks";
import { getQuizAnswerSheet, storeQuizAnswerSheet } from "@/utils";
import {
  AddressesType,
  AnswerType,
  ChapterAddressType,
  CoursePageStatusType,
  CourseType,
  QuizAnswerSheetType,
  QuizAnswerType,
  QuizPhaseType,
  QuizQuestionType,
  StateType,
} from "@/types";
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
  stateLoading,
  stateSwapChapters,
  statePage,
  statePageStatus,
  stateSwapPages,
  courseDetail,
  courseDetailWithProgress,
  chapterAddress,
  trueLoading,
  handleCheckAnswer,
  handleCleanUpStates,
}: {
  addreses: AddressesType;
  chapterContent: string;
  answerRef: MutableRefObject<Partial<AnswerType>>;
  acceptRef: MutableRefObject<AnswerType>;
  mountedRef: MutableRefObject<Record<string, string | boolean>>;
  stateLoading: StateType<boolean>;
  statePageStatus: StateType<CoursePageStatusType>;
  stateSwapChapters: StateType<boolean>;
  stateSwapPages: StateType<boolean>;
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
  handleCleanUpStates: () => void;
}) {
  const answer = answerRef.current;
  const accept = acceptRef.current;
  const [pageStatus, setPageStatus] = statePageStatus;
  const { submitted, quizPhase } = pageStatus;
  const setSwapChapters = stateSwapChapters[1];
  const { quizAnswerSheetRef, quizDetails } = useQuiz({
    chapterAddress,
    courseDetail,
    answer,
    accept,
  });
  const quizQuestionsRef = useRef<Record<string, QuizQuestionType>>({});
  const quizAnswerSheet = quizAnswerSheetRef.current;
  const setLoading = stateLoading[1];
  const setPage = statePage[1];

  const debounce = useDebounce();
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
    debounce(() => {
      const now = new Date().getTime();
      const points = Object.values(quizAnswerSheetRef.current.summary).reduce(
        (prev, { points = 0 }) => prev + points,
        0
      );
      // setQuizPhase("submitted");
      setPageStatus((prev) => ({
        ...prev,
        submitted: true,
        quizPhase: "submitted",
      }));

      const finalAnswerSheet: QuizAnswerSheetType = {
        ...quizAnswerSheetRef.current,
        submittedAt: now,
        points,
        answers: answerRef.current,
      };
      storeQuizAnswerSheet(chapterAddress, finalAnswerSheet);
      quizAnswerSheetRef.current = finalAnswerSheet;
    });
  }, [answerRef, chapterAddress, debounce, quizAnswerSheetRef, setPageStatus]);

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
        setPageStatus((prev) => ({
          ...prev,
          submitted: true,
          quizPhase: "onboarding",
        }));
        answerRef.current = existing.answers;
      } else if (exists && !existing.submittedAt) {
        quizAnswerSheetRef.current = existing;
        answerRef.current = existing.answers;
        addToast({
          phrase: "courseQuizContinueFromBackUp",
        });
        setPageStatus((prev) => ({
          ...prev,
          quizPhase: "onboarding",
        }));
      }

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
    setPageStatus,
    setSwapChapters,
  ]);

  const handleOnboardingButton = useCallback(() => {
    debounce(() => {
      if (
        quizAnswerSheet &&
        quizAnswerSheet.startAt &&
        !quizAnswerSheet.submittedAt
      ) {
        // setQuizPhase("working");
        setPageStatus((prev) => ({
          ...prev,
          quizPhase: "working",
        }));
        return;
      }

      const now = new Date();
      const end = new Date();
      if (quizDetails) {
        end.setMinutes(end.getMinutes() + quizDetails.duration);
        end.setSeconds(end.getSeconds() + 1);
      }

      if (!submitted) {
        // setQuizPhase("working");
        setPageStatus((prev) => ({
          ...prev,
          quizPhase: "working",
        }));
        quizAnswerSheetRef.current.startAt = now.getTime();
        quizAnswerSheetRef.current.endAt = end.getTime();
      } else {
        // setQuizPhase("submitted");
        setPageStatus((prev) => ({
          ...prev,
          quizPhase: "submitted",
        }));
      }
    });
  }, [
    debounce,
    quizAnswerSheet,
    quizAnswerSheetRef,
    quizDetails,
    setPageStatus,
    submitted,
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
          statePage={statePage}
          statePageStatus={statePageStatus}
          stateSwapPages={stateSwapPages}
          handleCheckAnswer={handleCheckAnswer}
          handleCleanUpStates={handleCleanUpStates}
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
      statePage,
      statePageStatus,
      stateSwapPages,
      handleCheckAnswer,
      handleCleanUpStates,
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
            onClick={handleOnboardingButton}
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
      handleOnboardingButton,
      handleSubmitQuiz,
      quizAnswerSheet.startAt,
      quizAnswerSheet.submittedAt,
      quizPhase,
      submitted,
      trueLoading,
    ]
  );

  return (
    <CourseLayoutTemplate
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
          statePageStatus={statePageStatus}
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
