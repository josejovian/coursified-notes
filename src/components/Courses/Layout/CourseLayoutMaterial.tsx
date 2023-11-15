import {
  MutableRefObject,
  useMemo,
  useEffect,
  useCallback,
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
import { storeChapterProgress } from "@/src/utils";
import Link from "next/link";
import { CourseJourney } from "../Journey";

export function CourseLayoutMaterial({
  addreses,
  chapterContent,
  chapterBaseAddress,
  stateAccept,
  stateAnswer,
  stateChecking,
  stateLoading,
  stateSolved,
  stateSubmitted,
  statePage,
  stateMaxPage,
  courseDetailWithProgress,
  chapterAddress,
  trueLoading,
  handleCheckAnswer,
  handleCleanUpStates,
}: {
  addreses: AddressesType;
  chapterBaseAddress: any;
  chapterContent: any;
  stateSolved: StateType<number>;
  stateAnswer: StateType<Partial<AnswerType>>;
  stateAccept: StateType<AnswerType>;
  stateLoading: StateType<boolean>;
  stateChecking: StateType<boolean>;
  stateSubmitted: StateType<boolean>;
  statePage: StateType<number>;
  stateMaxPage: StateType<number>;
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
  const { read } = addreses;
  const [answer, setAnswer] = stateAnswer;
  const [accept, setAccept] = stateAccept;
  const setSubmitted = stateSubmitted[1];
  const setSolved = stateSolved[1];
  const setLoading = stateLoading[1];
  const solved = stateSolved[0];
  const [checking, setChecking] = stateChecking;
  const [page, setPage] = statePage;
  const [maxPage, setMaxPage] = stateMaxPage;

  const { addToast } = useToast();
  const router = useRouter();

  const nextDestination = useMemo(() => {
    const { sections } = courseDetailWithProgress;
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
  }, [chapterAddress, courseDetailWithProgress]);

  const { id, sections } = courseDetailWithProgress;
  const { title, description } = courseDetailWithProgress;

  const handlePreviousPage = useCallback(() => {
    setLoading(true);
    handleCleanUpStates();
    if (page > 0) setPage((prev) => prev - 1);
  }, [handleCleanUpStates, page, setLoading, setPage]);

  const handleNextPage = useCallback(() => {
    setLoading(true);
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
    setLoading,
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

  const renderPageContents = useMemo(
    () => (
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
      />
    ),
    [
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
      setPage,
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
      accept,
      addToast,
      answer,
      checking,
      handleCheckAnswer,
      handleNextPage,
      handlePreviousPage,
      maxPage,
      page,
      setChecking,
      setSolved,
      setSubmitted,
      solved,
      trueLoading,
    ]
  );

  return (
    <TemplateGeneric
      sideHeaderImage={{
        src: "/calculus.jpg",
      }}
      sideHeaderElement={
        <>
          <Link href={`/${id}`} legacyBehavior>
            <a>
              <Paragraph as="h2" size="l" weight="bold" color="secondary-1">
                {title}
              </Paragraph>
            </a>
          </Link>
          <Paragraph as="p" color="secondary-1">
            {description}
          </Paragraph>
          <Paragraph size="m-alt" color="secondary-1">
            Jose Jovian
          </Paragraph>
        </>
      }
      sideElement={
        <CourseJourney
          course={courseDetailWithProgress}
          chapterAddress={chapterAddress}
          disabled={trueLoading}
          noBorder
          noPadding
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
        {renderPageControls}
      </div>
    </TemplateGeneric>
  );
}
