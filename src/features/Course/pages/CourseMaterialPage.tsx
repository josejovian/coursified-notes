import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import "katex/dist/katex.min.css";
import { useRouter } from "next/router";
import { SwapPageContext } from "@/contexts";
import {
  checkChapterProgress,
  getSpecificChapterAddress,
  storeChapterProgress,
} from "@/utils";
import {
  AnswerType,
  ChapterAddressType,
  CoursePageStatusType,
  CourseType,
  QuizPhaseType,
} from "@/types";
import { useDebounce, useProgress } from "@/hooks";
import { CourseLayoutQuiz, CourseLayoutMaterial } from "../layouts";

interface CourseMaterialProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  markdown: any;
  chapterAddress: ChapterAddressType;
  rawCourseDetail: string;
}

export function CoursePage({
  markdown,
  chapterAddress,
  rawCourseDetail,
}: CourseMaterialProps) {
  const router = useRouter();

  const statePage = useState(0);
  const stateMaxPage = useState(0);
  const page = statePage[0];
  const setMaxPage = stateMaxPage[1];
  const stateLoading = useState(true);
  const stateSwapChapters = useState(false);
  const stateSwapPages = useState(false);
  const stateProblemCount = useState(0);
  const stateLastUpdate = useState(0);
  const swapPages = stateSwapPages[0];
  const [loading, setLoading] = stateLoading;
  const [swapChapters, setSwapChapters] = stateSwapChapters;
  const answerRef = useRef<Partial<AnswerType>>({});
  const acceptRef = useRef<AnswerType>({});
  const mountedRef = useRef<Record<string, boolean>>({});
  const accept = acceptRef.current;
  const statePageStatus = useState<CoursePageStatusType>({
    checking: false,
    submitted: false,
  });
  const [_, setPageStatus] = statePageStatus;
  const stateQuizPhase = useState<QuizPhaseType>();
  const debounce = useDebounce();

  const courseDetail: CourseType = useMemo(
    () => JSON.parse(rawCourseDetail) as CourseType,
    [rawCourseDetail]
  );
  const { id, sections } = courseDetail;
  const { sectionData, updateData } = useProgress({ id, sections });
  const courseDetailWithProgress: CourseType = useMemo(
    () => ({
      ...courseDetail,
      sections: sectionData,
    }),
    [courseDetail, sectionData]
  );
  const chapterContent = useMemo(() => markdown[page].code, [markdown, page]);
  const trueLoading = useMemo(
    () => swapPages || swapChapters || loading,
    [loading, swapChapters, swapPages]
  );
  const chapterBaseAddress = useMemo<ChapterAddressType>(
    () => ({
      ...chapterAddress,
      page,
    }),
    [page, chapterAddress]
  );
  const addresses = useMemo(
    () => ({
      read: getSpecificChapterAddress(chapterBaseAddress, "read"),
      practice: getSpecificChapterAddress(chapterBaseAddress, "practice"),
    }),
    [chapterBaseAddress]
  );

  const { practice } = addresses;

  const handleCheckAnswer = useCallback(
    (
      userAnswer: string,
      practiceId: string,
      updateCheckingState: boolean = true
    ) => {
      if (updateCheckingState) {
        setPageStatus((prev) => ({
          ...prev,
          checking: true,
        }));
      }

      const result = (() => {
        const exactAnswer: string = accept[practiceId];
        return Boolean(
          exactAnswer &&
            (exactAnswer === userAnswer ||
              String(exactAnswer.replace(" ", "")) ===
                String(userAnswer.replace(" ", "")) ||
              exactAnswer.toLowerCase() === userAnswer.toLowerCase())
        );
      })();

      if (result && updateCheckingState) {
        const existingData = checkChapterProgress(practice) ?? {};
        storeChapterProgress(practice, {
          ...existingData,
          [practiceId]: userAnswer,
        });
      }

      if (updateCheckingState) {
        debounce(() => {
          setPageStatus((prev) => ({
            ...prev,
            checking: false,
          }));
        }, 1000);
      }
      return result;
    },
    [accept, debounce, practice, setPageStatus]
  );

  const handleSetMaxPage = useCallback(() => {
    setMaxPage(markdown.length);
    setLoading(false);
    updateData();
  }, [markdown.length, setLoading, setMaxPage, updateData]);

  useEffect(() => {
    handleSetMaxPage();
  }, [handleSetMaxPage, swapChapters]);

  const handleCleanUpStates = useCallback(
    (reason?: string) => {
      console.log("Clean Up: ", reason);
      answerRef.current = {};
      acceptRef.current = {};
      mountedRef.current = {};
      // setSolved(-1);
      // setSubmitted(false);
      // setChecking(false);
      setPageStatus({
        checking: false,
        submitted: false,
        solved: undefined,
        quizPhase: undefined,
      });
    },
    [setPageStatus]
  );

  const handleRouteChangeStart = useCallback(
    (next: string) => {
      if (next === `/${chapterAddress.course}`) return;

      setSwapChapters(true);
      handleCleanUpStates("Route Change Start");
    },
    [chapterAddress.course, handleCleanUpStates, setSwapChapters]
  );

  const handleRouteChangeComplete = useCallback(() => {
    setSwapChapters(false);
    handleCleanUpStates("Route Change End");
  }, [handleCleanUpStates, setSwapChapters]);

  useEffect(() => {
    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
    };
  }, [handleRouteChangeComplete, handleRouteChangeStart, router.events]);

  const renderCourseQuiz = useMemo(
    () => (
      <CourseLayoutQuiz
        addreses={addresses}
        chapterAddress={chapterAddress}
        chapterContent={chapterContent}
        courseDetail={courseDetail}
        courseDetailWithProgress={courseDetailWithProgress}
        handleCheckAnswer={handleCheckAnswer}
        handleCleanUpStates={handleCleanUpStates}
        acceptRef={acceptRef}
        answerRef={answerRef}
        mountedRef={mountedRef}
        stateLoading={stateLoading}
        statePage={statePage}
        statePageStatus={statePageStatus}
        stateProblemCount={stateProblemCount}
        stateLastUpdate={stateLastUpdate}
        stateSwapChapters={stateSwapChapters}
        stateSwapPages={stateSwapPages}
        stateQuizPhase={stateQuizPhase}
        trueLoading={trueLoading}
      />
    ),
    [
      addresses,
      chapterAddress,
      chapterContent,
      courseDetail,
      courseDetailWithProgress,
      handleCheckAnswer,
      handleCleanUpStates,
      stateLastUpdate,
      stateLoading,
      statePage,
      statePageStatus,
      stateProblemCount,
      stateQuizPhase,
      stateSwapChapters,
      stateSwapPages,
      trueLoading,
    ]
  );

  const renderCourseMaterial = useMemo(
    () => (
      <CourseLayoutMaterial
        addreses={addresses}
        chapterAddress={chapterAddress}
        chapterBaseAddress={chapterBaseAddress}
        chapterContent={chapterContent}
        courseDetailWithProgress={courseDetailWithProgress}
        handleCheckAnswer={handleCheckAnswer}
        handleCleanUpStates={handleCleanUpStates}
        acceptRef={acceptRef}
        answerRef={answerRef}
        mountedRef={mountedRef}
        stateLoading={stateLoading}
        statePage={statePage}
        statePageStatus={statePageStatus}
        stateMaxPage={stateMaxPage}
        stateProblemCount={stateProblemCount}
        stateLastUpdate={stateLastUpdate}
        stateSwapPages={stateSwapPages}
        trueLoading={trueLoading}
      />
    ),
    [
      addresses,
      chapterAddress,
      chapterBaseAddress,
      chapterContent,
      courseDetailWithProgress,
      handleCheckAnswer,
      handleCleanUpStates,
      stateLastUpdate,
      stateLoading,
      stateMaxPage,
      statePage,
      statePageStatus,
      stateProblemCount,
      stateSwapPages,
      trueLoading,
    ]
  );

  const renderPage = useMemo(() => {
    if (chapterAddress.chapter === "quiz") {
      return renderCourseQuiz;
    }
    return renderCourseMaterial;
  }, [chapterAddress.chapter, renderCourseMaterial, renderCourseQuiz]);

  return (
    <SwapPageContext.Provider value={stateSwapPages}>
      {renderPage}
    </SwapPageContext.Provider>
  );
}
