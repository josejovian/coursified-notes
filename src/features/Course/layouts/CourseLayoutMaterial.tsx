import { MutableRefObject, useMemo, useCallback, useEffect } from "react";
import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDebounce, useToast } from "@/hooks";
import { storeChapterProgress } from "@/utils";
import {
  AddressesType,
  AnswerType,
  ChapterAddressType,
  CoursePageStatusType,
  CourseType,
  StateType,
} from "@/types";
import { Button, Paragraph } from "@/components";
import { CourseJourney } from "../components/CourseJourney";
import { CourseLayoutMain } from "./CourseLayoutMain";
import { CourseLayoutSideHeader } from "./CourseLayoutSideHeader";
import { CourseLayoutTemplate } from "./CourseLayoutTemplate";

export function CourseLayoutMaterial({
  addreses,
  chapterContent,
  chapterBaseAddress,
  acceptRef,
  answerRef,
  mountedRef,
  stateLoading,
  statePage,
  statePageStatus,
  stateMaxPage,
  stateSwapPages,
  courseDetailWithProgress,
  chapterAddress,
  trueLoading,
  handleCheckAnswer,
  handleCleanUpStates,
}: {
  addreses: AddressesType;
  chapterBaseAddress: ChapterAddressType;
  chapterContent: string;
  answerRef: MutableRefObject<Partial<AnswerType>>;
  acceptRef: MutableRefObject<AnswerType>;
  mountedRef: MutableRefObject<Record<string, string | boolean>>;
  stateLoading: StateType<boolean>;
  statePage: StateType<number>;
  statePageStatus: StateType<CoursePageStatusType>;
  stateMaxPage: StateType<number>;
  stateSwapPages: StateType<boolean>;
  stateProblemCount: StateType<number>;
  stateLastUpdate: StateType<number>;
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
  const setLoading = stateLoading[1];
  const [page, setPage] = statePage;
  const [pageStatus, setPageStatus] = statePageStatus;
  const setSwapPages = stateSwapPages[1];
  const debounce = useDebounce();
  const { checking, solved, submitted } = pageStatus;
  const maxPage = stateMaxPage[0];
  const accept = acceptRef.current;

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

  const { id, title, description } = courseDetailWithProgress;

  const handlePreviousPage = useCallback(() => {
    handleCleanUpStates();
    if (page > 0) setPage((prev) => prev - 1);
  }, [handleCleanUpStates, page, setPage]);

  const handleNextPage = useCallback(() => {
    handleCleanUpStates();
    if (solved !== false) storeChapterProgress(read, true);
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
      debounce(() => {
        router.replace(nextDestination);
      });
    }
  }, [
    handleCleanUpStates,
    solved,
    read,
    page,
    maxPage,
    setPage,
    chapterBaseAddress,
    debounce,
    router,
    nextDestination,
  ]);

  const renderPageContents = useMemo(
    () => (
      <CourseLayoutMain
        addreses={addreses}
        markdown={chapterContent}
        acceptRef={acceptRef}
        answerRef={answerRef}
        mountedRef={mountedRef}
        stateLoading={stateLoading}
        trueLoading={trueLoading}
        statePageStatus={statePageStatus}
        statePage={statePage}
        stateSwapPages={stateSwapPages}
        handleCheckAnswer={handleCheckAnswer}
        onChapterChange={() => setPage(0)}
        onInputBlur={() => {
          if (submitted)
            setPageStatus((prev) => ({
              ...prev,
              submitted: false,
            }));
        }}
      />
    ),
    [
      addreses,
      chapterContent,
      acceptRef,
      answerRef,
      mountedRef,
      stateLoading,
      trueLoading,
      statePageStatus,
      statePage,
      stateSwapPages,
      handleCheckAnswer,
      setPage,
      submitted,
      setPageStatus,
    ]
  );

  useEffect(() => {
    console.log("True Loading: ", trueLoading);
  }, [trueLoading]);

  const renderPageControls = useMemo(
    () => (
      <>
        <Button
          color="secondary"
          size="l"
          onClick={() => {
            // setSwapPages(true);
            debounce(() => {
              setLoading(true);
              handlePreviousPage();
            });
          }}
          disabled={page <= 0 || trueLoading}
        >
          Back
        </Button>
        <Paragraph as="span" size="l">
          {page + 1} / {maxPage}
        </Paragraph>
        {solved || solved === undefined ? (
          <Button
            size="l"
            onClick={() => {
              // setSwapPages(true);
              debounce(() => {
                setLoading(true);
                handleNextPage();
              });
            }}
            disabled={trueLoading}
          >
            Next
          </Button>
        ) : (
          <Button
            size="l"
            onClick={() => {
              setPageStatus((prev) => ({
                ...prev,
                checking: true,
                submitted: true,
              }));

              if (
                Object.values(answerRef.current).length ===
                Object.values(accept).length
              ) {
                const correct = !Object.entries(answerRef.current).some(
                  ([key, ans]) => {
                    return !handleCheckAnswer(ans ?? "", key);
                  }
                );

                if (correct) {
                  setPageStatus((prev) => ({
                    ...prev,
                    solved: true,
                  }));
                  addToast({
                    phrase: "courseMaterialPracticeAnsweredCorrect",
                  });
                } else {
                  addToast({
                    phrase: "courseMaterialPracticeAnsweredIncorrect",
                  });
                }
              } else {
                debounce(() => {
                  setPageStatus((prev) => ({
                    ...prev,
                    checking: false,
                  }));
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
      answerRef,
      checking,
      debounce,
      handleCheckAnswer,
      handleNextPage,
      handlePreviousPage,
      maxPage,
      page,
      setLoading,
      setPageStatus,
      solved,
      trueLoading,
    ]
  );

  return (
    <CourseLayoutTemplate
      sideElement={
        <>
          <CourseLayoutSideHeader
            sideHeaderImage={{
              src: "/calculus.jpg",
            }}
          >
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
          </CourseLayoutSideHeader>
          <CourseJourney
            course={courseDetailWithProgress}
            chapterAddress={chapterAddress}
            disabled={trueLoading}
            noBorder
            noPadding
            scrollable
          />
        </>
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
    </CourseLayoutTemplate>
  );
}
