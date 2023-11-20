import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import clsx from "clsx";
import "katex/dist/katex.min.css";
import { useRouter } from "next/router";
import {
  AnswerType,
  ChapterAddressType,
  CourseType,
  QuizAnswerSheetType,
  QuizAnswerType,
  QuizConfigType,
  QuizPhaseType,
  QuizQuestionType,
} from "@/src/type";
import {
  checkChapterProgress,
  getQuizAnswerSheet,
  getSpecificChapterAddress,
  storeChapterProgress,
  storeQuizAnswerSheet,
} from "@/src/utils";
import {
  Button,
  CourseLayoutMain,
  CourseQuizOnboarding,
  CourseLayoutSide,
  Paragraph,
  TemplateGeneric,
  IconText,
} from "@/src/components";
import { SwapPageContext } from "@/src/contexts";
import {
  readAllChapters,
  readAllSections,
  readAllCourses,
  getDetailedCourse,
  readChapterMd,
} from "@/src/lib/mdx";
import { useProgress, useQuiz, useToast } from "@/src/hooks";
import { CourseQuizTimer } from "@/src/components/Courses/Quiz/CourseQuizTimer";
import { BsFillClockFill } from "react-icons/bs";
import Link from "next/link";
import { CourseLayoutQuiz } from "@/src/components/Courses/Layout/CourseLayoutQuiz";
import { CourseLayoutMaterial } from "@/src/components/Courses/Layout/CourseLayoutMaterial";

interface CourseMaterialProps {
  markdown: any;
  chapterAddress: ChapterAddressType;
  rawCourseDetail: any;
}

const CourseMaterial = ({
  markdown,
  chapterAddress,
  rawCourseDetail,
}: CourseMaterialProps) => {
  const router = useRouter();

  const statePage = useState(0);
  const stateMaxPage = useState(0);
  const [page, setPage] = statePage;
  const stateSolved = useState(-1);
  const [solved, setSolved] = stateSolved;
  const [maxPage, setMaxPage] = stateMaxPage;
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
  const answer = answerRef.current;
  const accept = acceptRef.current;
  const stateSubmitted = useState(false);
  const stateChecking = useState(false);
  const [checking, setChecking] = stateChecking;
  const [submitted, setSubmitted] = stateSubmitted;
  const bottomRef = useRef<HTMLDivElement>(null);

  const { addToast } = useToast();

  const courseDetail: CourseType = useMemo(
    () => JSON.parse(rawCourseDetail) as CourseType,
    [rawCourseDetail]
  );

  const stateQuizPhase = useState<QuizPhaseType>();
  const [quizPhase, setQuizPhase] = stateQuizPhase;

  const { title, description } = courseDetail;

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

  const chapterBaseAddress = useMemo(
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

  const { read, practice } = addresses;

  const handleCheckAnswer = useCallback(
    (
      userAnswer: string,
      practiceId: string,
      updateCheckingState: boolean = true
    ) => {
      if (updateCheckingState) {
        setChecking(true);
        setTimeout(() => {
          setChecking(false);
        }, 1000);
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

      return result;
    },
    [accept, practice, setChecking]
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
      answerRef.current = {};
      acceptRef.current = {};
      mountedRef.current = {};
      setSolved(-1);
      setSubmitted(false);
      setChecking(false);
    },
    [setChecking, setSolved, setSubmitted]
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
    // handleCleanUpStates("Route Change End");
  }, [setSwapChapters]);

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
        acceptRef={acceptRef}
        answerRef={answerRef}
        mountedRef={mountedRef}
        stateChecking={stateChecking}
        stateLoading={stateLoading}
        statePage={statePage}
        stateProblemCount={stateProblemCount}
        stateLastUpdate={stateLastUpdate}
        stateSolved={stateSolved}
        stateSubmitted={stateSubmitted}
        stateSwapChapters={stateSwapChapters}
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
      stateChecking,
      stateLastUpdate,
      stateLoading,
      statePage,
      stateProblemCount,
      stateQuizPhase,
      stateSolved,
      stateSubmitted,
      stateSwapChapters,
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
        stateChecking={stateChecking}
        stateLoading={stateLoading}
        statePage={statePage}
        stateMaxPage={stateMaxPage}
        stateProblemCount={stateProblemCount}
        stateLastUpdate={stateLastUpdate}
        stateSolved={stateSolved}
        stateSubmitted={stateSubmitted}
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
      stateChecking,
      stateLastUpdate,
      stateLoading,
      stateMaxPage,
      statePage,
      stateProblemCount,
      stateSolved,
      stateSubmitted,
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
};

export const getStaticPaths = async () => {
  const {} = require("../../../src/lib/mdx.tsx");
  const courses: string[] = await readAllCourses();

  const strings = await Promise.all(
    courses.map(async (course) => {
      const sections: string[] = await readAllSections(course);
      return await Promise.all(
        sections
          .filter((x) => !x.includes(".json"))
          .map(async (section) => {
            const chapters: string[] = await readAllChapters(course, section);
            return await Promise.all(
              chapters.map((chapter) => ({
                params: {
                  course: course,
                  section: section,
                  chapter: chapter.replace(".mdx", ""),
                },
              }))
            );
          })
      );
    })
  );

  return {
    paths: strings.flat(4),
    fallback: false,
  };
};

export const getStaticProps = async (req: any) => {
  const { course, section, chapter } = req.params;

  const params = { course, section, chapter };

  const { pages } = await readChapterMd(course, section, chapter);

  const courseDetail = (await getDetailedCourse(course)) as CourseType;

  const sectionIndex = courseDetail.sections.findIndex((value) => {
    return section === value.id;
  });

  return {
    props: {
      markdown: pages,
      chapterAddress: {
        ...params,
        sectionIndex,
      },
      rawCourseDetail: JSON.stringify(courseDetail),
    },
  };
};

export default CourseMaterial;
