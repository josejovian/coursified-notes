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
  const [maxPage, setMaxPage] = useState(0);
  const stateLoading = useState(true);
  const stateSwapChapters = useState(false);
  const stateSwapPages = useState(false);
  const swapPages = stateSwapPages[0];
  const [loading, setLoading] = stateLoading;
  const [swapChapters, setSwapChapters] = stateSwapChapters;
  const stateAnswer = useState<Partial<AnswerType>>({});
  const [answer, setAnswer] = stateAnswer;
  const stateAccept = useState<AnswerType>({});
  const [accept, setAccept] = stateAccept;
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

  useEffect(() => {
    console.log("Set Max Page: ", markdown.length);
    setMaxPage(markdown.length);
    setLoading(false);
    updateData();
  }, [markdown, setLoading, updateData]);

  const handleCleanUpStates = useCallback(() => {
    setLoading(true);
    setSolved(-1);
    setSubmitted(false);
    setAnswer({});
    setAccept({});
  }, [setAccept, setAnswer, setLoading, setSolved, setSubmitted]);

  const handleRouteChangeStart = useCallback(
    (next: string) => {
      if (next === `/${chapterAddress.course}`) return;

      setSwapChapters(true);
      handleCleanUpStates();
    },
    [chapterAddress.course, handleCleanUpStates, setSwapChapters]
  );

  const handleRouteChangeComplete = useCallback(() => {
    setSwapChapters(false);
    handleCleanUpStates();
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
        courseDetailWithProgress={courseDetailWithProgress}
        handleCheckAnswer={handleCheckAnswer}
        stateAccept={stateAccept}
        stateAnswer={stateAnswer}
        stateChecking={stateChecking}
        stateLoading={stateLoading}
        statePage={statePage}
        stateSolved={stateSolved}
        stateSubmitted={stateSubmitted}
        stateSwapChapters={stateSwapChapters}
        trueLoading={trueLoading}
      />
    ),
    [
      addresses,
      chapterAddress,
      chapterContent,
      courseDetailWithProgress,
      handleCheckAnswer,
      stateAccept,
      stateAnswer,
      stateChecking,
      stateLoading,
      statePage,
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
        stateAccept={stateAccept}
        stateAnswer={stateAnswer}
        stateChecking={stateChecking}
        stateLoading={stateLoading}
        statePage={statePage}
        stateMaxPage={stateMaxPage}
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
      stateAccept,
      stateAnswer,
      stateChecking,
      stateLoading,
      stateMaxPage,
      statePage,
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
