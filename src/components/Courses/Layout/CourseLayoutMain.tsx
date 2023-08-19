import clsx from "clsx";
import { useCallback, useState, useRef, useMemo, useEffect } from "react";
import { getMDXComponent } from "mdx-bundler/client";
import TeX from "@matejmazur/react-katex";
import { AddressesType, AnswerType, StateType } from "@/src/type";
import { checkChapterProgress } from "@/src/utils";
import { Blockquote, Input, Loader, Paragraph } from "@/src/components";
import { useRouter } from "next/router";
import { useCustom } from "@/src/hooks";

import dynamic from "next/dynamic";

const Graph = dynamic(() => import("../Entity/Graph/CourseEntityGraph"), {
  ssr: false,
});

interface CourseMaterialContentProps {
  markdown: any;
  addreses: AddressesType;
  stateSolved: StateType<number>;
  stateAnswer: StateType<Partial<AnswerType>>;
  stateAccept: StateType<AnswerType>;
  stateLoading: StateType<boolean>;
  stateChecking: StateType<boolean>;
  stateSubmitted: StateType<boolean>;
  trueLoading: boolean;
  page: number;
  handleCheckAnswer: (ans: string, id: string, flag?: boolean) => boolean;
  onChapterChange?: () => void;
}

export function CourseLayoutMain({
  markdown,
  addreses,
  stateSolved,
  stateAnswer,
  stateAccept,
  stateLoading,
  stateSubmitted,
  trueLoading,
  page,
  handleCheckAnswer,
  onChapterChange,
}: CourseMaterialContentProps) {
  const router = useRouter();
  const [loading, setLoading] = stateLoading;
  const [answer, setAnswer] = stateAnswer;
  const [accept, setAccept] = stateAccept;
  const [solved, setSolved] = stateSolved;
  const [submitted, setSubmmited] = stateSubmitted;
  const stateActive = useState<any>(null);
  const active = stateActive[0];
  const inputRef = useRef<Record<string, boolean>>({});

  const {
    handleOnePairMatch,
    handleRenderAnswerBoxes,
    handleRenderMatch,
    handleRenderOptions,
    handleConvertCodeToComponents,
    handleRemoveAllCustomComponents,
  } = useCustom({
    handleCheckAnswer,
    stateAccept,
    stateActive,
    stateAnswer,
    stateLoading,
    stateSolved,
    stateSubmitted,
    inputRef,
  });

  const { practice } = addreses;

  const Content = useMemo(() => getMDXComponent(markdown), [markdown]);

  const userAnswerStatus = useCallback(
    (practiceId: string) => {
      const specificAnswer = answer[practiceId];
      if (specificAnswer && submitted)
        return handleCheckAnswer(specificAnswer, practiceId, false)
          ? "success"
          : "error";
      return undefined;
    },
    [answer, submitted, handleCheckAnswer]
  );

  useEffect(() => {
    handleOnePairMatch();
  }, [active, handleOnePairMatch]);

  useEffect(() => {
    handleRenderAnswerBoxes();
    handleRenderMatch();
    handleRenderOptions();
  }, [
    page,
    active,
    accept,
    answer,
    solved,
    userAnswerStatus,
    handleRenderAnswerBoxes,
    handleRenderMatch,
    handleRenderOptions,
  ]);

  const handleRemoveUndefinedAnswers = useCallback(() => {
    const entries = Object.entries(answer);
    const newAnswer: { [key: string]: string } = {};
    let different = false;
    entries.forEach(([k, v]) => {
      if (typeof v !== "undefined") {
        newAnswer[k] = v;
      } else {
        different = true;
      }
    });
    if (different) {
      setAnswer(newAnswer);
    }
  }, [answer, setAnswer]);

  useEffect(() => {
    handleRemoveUndefinedAnswers();
  }, [answer, handleRemoveUndefinedAnswers]);

  const handleGetExistingAnswerIfAny = useCallback(() => {
    const existingAnswers = checkChapterProgress(practice);
    const practiceIds = Object.keys(accept);

    if (practiceIds.length === 0) return;

    let currentAnswers = {};
    let allAnswersAreCorrect = true;
    practiceIds.forEach((practiceId: string) => {
      if (
        existingAnswers &&
        existingAnswers[practiceId] &&
        handleCheckAnswer(existingAnswers[practiceId], practiceId, false)
      ) {
        const specificAnswer = existingAnswers[practiceId];
        if (specificAnswer) {
          currentAnswers = {
            ...currentAnswers,
            [practiceId]: specificAnswer,
          };
        }
      } else {
        allAnswersAreCorrect = false;
      }
    });

    if (
      allAnswersAreCorrect &&
      Object.keys(currentAnswers).length === practiceIds.length &&
      practiceIds.length > 0
    ) {
      setAnswer(currentAnswers);
      setSubmmited(true);
      setSolved(1);
    }
  }, [practice, accept, handleCheckAnswer, setAnswer, setSubmmited, setSolved]);

  useEffect(() => {
    handleGetExistingAnswerIfAny();
  }, [accept, handleGetExistingAnswerIfAny]);

  const handlePrepareNewPage = useCallback(() => {
    if (loading) {
      handleRemoveAllCustomComponents();
      handleConvertCodeToComponents();
      setLoading(false);
    }
  }, [
    handleConvertCodeToComponents,
    handleRemoveAllCustomComponents,
    loading,
    setLoading,
  ]);

  useEffect(() => {
    handlePrepareNewPage();
  }, [page, handlePrepareNewPage]);

  const handleRouteChangeStart = useCallback(() => {
    onChapterChange && onChapterChange();
    handleRemoveAllCustomComponents();
  }, [handleRemoveAllCustomComponents, onChapterChange]);

  useEffect(() => {
    router.events.on("routeChangeStart", handleRouteChangeStart);
    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
    };
  }, [
    onChapterChange,
    handlePrepareNewPage,
    handleRemoveAllCustomComponents,
    router.events,
    handleRouteChangeStart,
  ]);

  const renderContents = useMemo(
    () => (
      <article
        className={clsx(
          "CourseMaterial_wrapper",
          "absolute left-0 top-0",
          "w-full h-full pt-24 p-adapt-sm",
          trueLoading && "hidden"
        )}
      >
        <div className="CourseMaterial_content">
          <Content
            components={{
              Graph: (props) => {
                const { functions = "", points = "" } = props;
                return <Graph id={`Graph_${functions}_${points}`} {...props} />;
              },
              TeX,
              Practice: ({ id, answer: answerKey, placeholder }) => (
                <Input
                  key={`InputBox-${id}`}
                  id={`InputBox-${id}`}
                  onBlur={(e) => {
                    // setSolved(1);
                    if (answer !== accept) {
                      setSubmmited(false);
                      setAnswer((prev) => ({
                        ...prev,
                        [id]: e.target.value,
                      }));
                    }
                  }}
                  defaultValue={answer[id]}
                  disabled={solved === 1 || userAnswerStatus(id) === "success"}
                  state={submitted && solved ? userAnswerStatus(id) : undefined}
                  mounted={inputRef.current[id]}
                  onMount={() => {
                    if (inputRef.current[id]) return;

                    inputRef.current[id] = true;

                    let answerKeys = {};

                    answerKeys = {
                      ...answerKeys,
                      [id]: answerKey,
                    };

                    setSolved(0);
                    console.log("Set Accept: ");
                    console.log(answerKey);
                    setAccept((prev) => ({
                      ...prev,
                      ...answerKeys,
                    }));
                  }}
                  placeholder={placeholder}
                />
              ),
              Explanation: ({ children }) => (
                <>
                  {solved === 1 && (
                    <Blockquote variant="explanation">{children}</Blockquote>
                  )}
                </>
              ),
              Formula: ({ children }) => (
                <Blockquote variant="formula">{children}</Blockquote>
              ),
              Example: ({ children }) => (
                <Blockquote variant="example">
                  <Paragraph weight="bold">Example</Paragraph>
                  {children}
                </Blockquote>
              ),
              Theorem: ({ children }) => (
                <Blockquote variant="theorem">
                  <Paragraph weight="bold">Theorem</Paragraph>
                  {children}
                </Blockquote>
              ),
              TexBlock: ({ children }) => {
                return <TeX block>{children}</TeX>;
              },
              Match: ({ id, left, right }) => (
                <span className="CustomMaterialInvoker hidden">{`[match]@${id}@${left}@${right}`}</span>
              ),
              Option: ({ id, content, truth }) => (
                <span className="CustomMaterialInvoker hidden">{`[option]@${id}@${content}@${
                  truth ? 1 : 0
                }`}</span>
              ),
            }}
          />
        </div>
      </article>
    ),
    [
      Content,
      accept,
      answer,
      setAccept,
      setAnswer,
      setSolved,
      setSubmmited,
      solved,
      submitted,
      trueLoading,
      userAnswerStatus,
    ]
  );

  return (
    <div className="relative flex w-full h-full overflow-x-hidden overflow-y-scroll">
      <div
        className={clsx(
          "self-center w-full h-full justify-self-center mx-auto",
          "flex justify-center items-center z-10",
          !trueLoading && "hidden"
        )}
      >
        <Loader />
      </div>
      {renderContents}
    </div>
  );
}
