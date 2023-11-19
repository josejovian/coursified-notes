import {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import {
  AddressesType,
  AnswerType,
  ChapterAddressType,
  CourseType,
  QuizAnswerSheetType,
  QuizAnswerType,
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
import { CourseLayoutQuizSide } from "./CourseLayoutQuizSide";

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
  stateProblemCount,
  stateLastUpdate,
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
  mountedRef: MutableRefObject<Record<string, boolean>>;
  stateLoading: StateType<boolean>;
  stateChecking: StateType<boolean>;
  stateSubmitted: StateType<boolean>;
  stateSwapChapters: StateType<boolean>;
  stateQuizPhase: StateType<QuizPhaseType>;
  statePage: StateType<number>;
  stateProblemCount: StateType<number>;
  stateLastUpdate: StateType<number>;
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
  const { endAt } = quizAnswerSheet;
  const [loading, setLoading] = stateLoading;
  const [lastUpdate, setLastUpdate] = useState(0);
  const setPage = statePage[1];

  const { addToast } = useToast();
  const router = useRouter();

  const handleUpdateSummary = useCallback(
    (ans: Partial<AnswerType>) => {
      console.log("Quiz Questions ");
      console.log(Object.entries(quizQuestionsRef.current));
      const individualQuestions = Object.entries(
        quizAnswerSheetRef.current.questions
      )
        .map(([key, value]) => {
          let answered = true;
          let correct = true;

          console.log(value);

          let relatedInputs = value.inputIds.reduce((prev, curr) => {
            if (!ans[curr]) answered = false;
            if (!ans[curr] || ans[curr] !== acceptRef.current[curr])
              correct = false;

            return {
              ...prev,
              [curr]: ans[curr],
            };
          }, {});
          let relatedKeys = value.inputIds.reduce((prev, curr) => {
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
    console.log("Store Answers: ");
    console.log(answerRef.current);
    // setSubmitted(true);
    setQuizPhase("submitted");
    const finalAnswerSheet: QuizAnswerSheetType = {
      ...quizAnswerSheetRef.current,
      submittedAt: now,
      points,
      answers: answerRef.current as any,
    };

    storeQuizAnswerSheet(chapterAddress, finalAnswerSheet);

    quizAnswerSheetRef.current = finalAnswerSheet;
  }, [answerRef, chapterAddress, quizAnswerSheetRef, setQuizPhase]);

  const handleUpdateAnswer = useCallback(
    (ans: Partial<AnswerType>) => {
      const summary = handleUpdateSummary(ans);

      const finalAnswerSheet: QuizAnswerSheetType = {
        ...quizAnswerSheet,
        answers: ans,
        summary,
      };

      console.log("Updating Answers: ");
      console.log(finalAnswerSheet);

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
      console.log(existing?.submittedAt);
      console.log(acceptRef.current);

      const exists = existing && Object.keys(existing).length;

      if (exists && existing.submittedAt) {
        quizAnswerSheetRef.current = existing;
        setSubmitted(true);
        answerRef.current = existing.answers as any;
      } else if (exists && !existing.submittedAt) {
        quizAnswerSheetRef.current = existing;
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
    acceptRef,
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
    console.log("Rerender: ", submitted);
  }, [submitted]);

  useEffect(() => {
    handleSetupQuiz();
  }, [quizDetails, handleSetupQuiz]);

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
          mountedRef={mountedRef}
          stateLoading={stateLoading}
          trueLoading={trueLoading}
          stateSolved={stateSolved}
          stateSubmitted={stateSubmitted}
          stateChecking={stateChecking}
          statePage={statePage}
          stateProblemCount={stateProblemCount}
          stateLastUpdate={stateLastUpdate}
          handleCheckAnswer={handleCheckAnswer}
          onChapterChange={() => setPage(0)}
          onAnswerUpdate={handleUpdateAnswer}
          onQuestionMount={(id, question) => {
            quizAnswerSheetRef.current.questions[id] = question;
          }}
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
      mountedRef,
      stateLoading,
      stateSolved,
      stateSubmitted,
      stateChecking,
      statePage,
      stateProblemCount,
      stateLastUpdate,
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
                quizAnswerSheetRef.current.startAt = now.getTime();
                quizAnswerSheetRef.current.endAt = end.getTime();
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
      quizAnswerSheetRef,
      quizDetails,
      quizPhase,
      setLoading,
      setQuizPhase,
      submitted,
      trueLoading,
    ]
  );

  return (
    <TemplateGeneric
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
    </TemplateGeneric>
  );
}
