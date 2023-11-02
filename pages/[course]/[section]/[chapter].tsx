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
import { CourseLayoutContentTemplate } from "@/src/components/Courses/Layout/CourseLayoutContentTemplate";
import { CourseQuizTimer } from "@/src/components/Courses/Quiz/CourseQuizTimer";

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

  const { stateQuizAnswerSheet, quizDetails, quizQuestions, stateQuizPhase } =
    useQuiz({
      chapterAddress,
      courseDetail,
      answer,
      accept,
    });
  const [quizPhase, setQuizPhase] = stateQuizPhase;
  const [quizAnswerSheet, setQuizAnswerSheet] = stateQuizAnswerSheet;
  const { endAt } = quizAnswerSheet;

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

  const nextDestination = useMemo(() => {
    const { sections } = courseDetail;
    let nextAddress: ChapterAddressType = chapterAddress;
    let lastSection = false;

    sections.some((section, idx1) => {
      if (section.id === chapterAddress.section) {
        const { chapters } = section;
        chapters.some((chapter, idx2) => {
          if (chapter.id === chapterAddress.chapter) {
            if (idx2 + 1 === chapters.length) {
              if (idx1 + 1 === sections.length) {
                lastSection = true;
              } else {
                const nextSection = sections[idx1 + 1];
                nextAddress = {
                  ...nextAddress,
                  section: nextSection.id ?? "",
                  chapter: nextSection.chapters[0].id ?? "",
                };
              }
            } else {
              nextAddress = {
                ...nextAddress,
                chapter: chapters[idx2 + 1].id ?? "",
              };
            }
            return true;
          }
          return false;
        });
        return true;
      }
      return false;
    });

    if (lastSection) {
      return `/${chapterAddress.course}`;
    }

    const { section, chapter } = nextAddress;

    return `/${chapterAddress.course}/${section}/${chapter}`;
  }, [chapterAddress, courseDetail]);

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
    setMaxPage(markdown.length);
    setLoading(false);
    updateData();
  }, [markdown, setLoading, updateData]);

  const handleSetupQuiz = useCallback(() => {
    if (quizDetails && !quizPhase) {
      const existing = getQuizAnswerSheet(chapterAddress);

      console.log(existing);

      if (!submitted && existing && Object.keys(existing).length) {
        setQuizAnswerSheet(existing);
        setSubmitted(true);
        setAnswer(existing.answers as any);
      }

      setQuizPhase("onboarding");
      setLoading(false);
      setSwapChapters(false);
    }
  }, [
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

  const handleCleanUpStates = useCallback(() => {
    setLoading(true);

    if (quizPhase === "working") {
    } else {
      setSolved(-1);
      setSubmitted(false);
      setAnswer({});
      setAccept({});
      setQuizPhase(undefined);
    }
  }, [
    quizPhase,
    setAccept,
    setAnswer,
    setLoading,
    setQuizPhase,
    setSolved,
    setSubmitted,
  ]);

  const handlePreviousPage = useCallback(() => {
    handleCleanUpStates();
    if (page > 0) setPage((prev) => prev - 1);
  }, [handleCleanUpStates, page, setPage]);

  const handleNextPage = useCallback(() => {
    handleCleanUpStates();
    if (solved !== 0) storeChapterProgress(read, true);
    if (page < maxPage - 1) {
      setPage((prev) => prev + 1);
    } else {
      storeChapterProgress(
        {
          ...chapterBaseAddress,
          page: undefined,
        },
        true
      );
      setTimeout(() => {
        router.replace(nextDestination);
      }, 250);
    }
  }, [
    handleCleanUpStates,
    solved,
    read,
    page,
    maxPage,
    setPage,
    chapterBaseAddress,
    router,
    nextDestination,
  ]);

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

  const renderQuizControls = useMemo(
    () =>
      quizPhase === "onboarding" ? (
        <Button
          size="l"
          onClick={() => {
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
          {submitted ? "View" : "Start"}
        </Button>
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
      quizDetails,
      quizPhase,
      setLoading,
      setQuizAnswerSheet,
      setQuizPhase,
      submitted,
      trueLoading,
    ]
  );

  const renderPageControls = useMemo(
    () => (
      <>
        <Button
          color="secondary"
          size="l"
          onClick={handlePreviousPage}
          disabled={page <= 0 || trueLoading}
        >
          Back
        </Button>
        <Paragraph as="span" size="l">
          {page + 1} / {maxPage}
        </Paragraph>
        {solved !== 0 ? (
          <Button size="l" onClick={handleNextPage} disabled={trueLoading}>
            Next
          </Button>
        ) : (
          <Button
            size="l"
            onClick={() => {
              setChecking(true);
              setSubmitted(true);

              if (
                Object.values(answer).length === Object.values(accept).length
              ) {
                const correct = !Object.entries(answer).some(
                  ([key, answer]) => {
                    return !handleCheckAnswer(answer ?? "", key);
                  }
                );

                if (correct) {
                  setSolved(1);
                  addToast({
                    phrase: "courseMaterialPracticeAnsweredCorrect",
                  });
                } else {
                  addToast({
                    phrase: "courseMaterialPracticeAnsweredIncorrect",
                  });
                }
              } else {
                setTimeout(() => {
                  setChecking(false);
                }, 1000);
                addToast({
                  phrase: "courseMaterialPracticeAnsweredIncorrect",
                });
              }
            }}
            disabled={
              trueLoading || checking
              // Object.values(answer).length !== Object.values(accept).length ||
              // Object.values(answer).filter((x) => x === "").length > 1
            }
          >
            Check
          </Button>
        )}
      </>
    ),
    [
      trueLoading,
      handlePreviousPage,
      page,
      maxPage,
      solved,
      checking,
      handleNextPage,
      setChecking,
      setSubmitted,
      answer,
      accept,
      handleCheckAnswer,
      setSolved,
      addToast,
    ]
  );

  const renderPageContents = useMemo(
    () =>
      quizPhase === "onboarding" && quizDetails ? (
        <CourseQuizOnboarding
          quizDetails={quizDetails}
          trueLoading={trueLoading}
        />
      ) : (
        <CourseLayoutMain
          addreses={addresses}
          markdown={chapterContent}
          stateAccept={stateAccept}
          stateAnswer={stateAnswer}
          stateLoading={stateLoading}
          trueLoading={trueLoading}
          stateSolved={stateSolved}
          stateSubmitted={stateSubmitted}
          stateChecking={stateChecking}
          stateQuizPhase={stateQuizPhase}
          statePage={statePage}
          handleCheckAnswer={handleCheckAnswer}
          onChapterChange={() => setPage(0)}
          quizQuestions={quizQuestions}
        />
      ),
    [
      quizPhase,
      quizDetails,
      trueLoading,
      addresses,
      chapterContent,
      stateAccept,
      stateAnswer,
      stateLoading,
      stateSolved,
      stateSubmitted,
      stateChecking,
      stateQuizPhase,
      statePage,
      handleCheckAnswer,
      quizQuestions,
      setPage,
    ]
  );

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

  return (
    <SwapPageContext.Provider value={stateSwapPages}>
      <div
        id="CourseMaterial"
        className="flex relative w-full h-screen overflow-hidden"
      >
        <CourseLayoutSide
          quizPhase={quizPhase}
          onQuizBack={() => {
            router.back();
          }}
          quizDetails={quizPhase !== "onboarding" ? quizDetails : undefined}
          quizAnswerSheet={quizAnswerSheet}
          quizQuestions={quizQuestions}
          courseDetail={courseDetailWithProgress}
          chapterAddress={chapterAddress}
          trueLoading={trueLoading}
        />
        <main className="relative flex flex-col flex-auto justify-between w-full overflow-hidden">
          {renderPageContents}
          {quizDetails && bottomRef.current && endAt && !submitted && (
            <CourseQuizTimer
              bottom={bottomRef.current.getBoundingClientRect().height}
              endAt={endAt}
              onTimeOut={handleSubmitQuiz}
            />
          )}
          <div
            className={clsx(
              "flex justify-center items-center p-8",
              "gap-8 w-full bg-gray-100",
              "border-t border-zinc-400"
            )}
            ref={bottomRef}
          >
            {quizDetails ? renderQuizControls : renderPageControls}
          </div>
        </main>
      </div>
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
