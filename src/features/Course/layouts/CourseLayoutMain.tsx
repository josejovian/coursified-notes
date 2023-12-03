import React, {
  useCallback,
  useMemo,
  useEffect,
  MutableRefObject,
} from "react";
import clsx from "clsx";
import { useRouter } from "next/router";
import { getMDXComponent } from "mdx-bundler/client";
import TeX from "@matejmazur/react-katex";
import { Blockquote, Input, Paragraph } from "@/components";
import { checkChapterProgress } from "@/utils";
import {
  AddressesType,
  AnswerType,
  CoursePageStatusType,
  QuizQuestionType,
  StateType,
} from "@/types";
import { CourseLayoutContentTemplate } from "./CourseLayoutContentTemplate";
import { Option, Graph } from "../components/CourseEntity";
import { useDebounce } from "@/hooks";

interface CourseMaterialContentProps {
  markdown: string;
  addreses: AddressesType;
  answerRef: MutableRefObject<Partial<AnswerType>>;
  acceptRef: MutableRefObject<AnswerType>;
  mountedRef: MutableRefObject<Record<string, string | boolean>>;
  stateLoading: StateType<boolean>;
  statePage: StateType<number>;
  statePageStatus: StateType<CoursePageStatusType>;
  stateSwapPages: StateType<boolean>;
  trueLoading: boolean;
  handleCheckAnswer: (ans: string, id: string, flag?: boolean) => boolean;
  handleCleanUpStates: () => void;
  onChapterChange?: () => void;
  onAnswerUpdate?: (answer: Partial<AnswerType>) => void;
  onQuestionMount?: (id: string, question: QuizQuestionType) => void;
  onOptionsMount?: (id: string, answer: string) => void;
  onInputBlur?: () => void;
  inputIsDisabled?: boolean;
}

export function CourseLayoutMain({
  markdown,
  addreses,
  acceptRef,
  answerRef,
  mountedRef,
  stateLoading,
  statePage,
  statePageStatus,
  stateSwapPages,
  trueLoading,
  handleCheckAnswer,
  handleCleanUpStates,
  onChapterChange,
  onAnswerUpdate,
  onQuestionMount,
  onOptionsMount,
  onInputBlur,
  inputIsDisabled,
}: CourseMaterialContentProps) {
  const router = useRouter();
  const [loading, setLoading] = stateLoading;
  const [pageStatus, setPageStatus] = statePageStatus;
  const { submitted, solved } = pageStatus;
  const page = statePage[0];
  const [swapPages, setSwapPages] = stateSwapPages;
  const accept = acceptRef.current;
  const debounce = useDebounce();

  const { practice } = addreses;

  const Content = useMemo(() => {
    return getMDXComponent(markdown);
  }, [markdown]);

  const userAnswerStatus = useCallback(
    (practiceId: string) => {
      const answer = answerRef.current;
      const specificAnswer = answer[practiceId];
      return specificAnswer &&
        handleCheckAnswer(specificAnswer, practiceId, false)
        ? "success"
        : "error";
    },
    [answerRef, handleCheckAnswer]
  );

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
      answerRef.current = accept;

      setPageStatus((prev) => ({
        ...prev,
        solved: true,
        submitted: true,
      }));
    }
  }, [practice, accept, handleCheckAnswer, answerRef, setPageStatus]);

  const handlePrepareNewPage = useCallback(() => {
    if (loading) {
      console.log("Page Rerender");
      mountedRef.current = {};
      setLoading(false);
      setSwapPages(false);
      handleCleanUpStates && handleCleanUpStates();
      handleGetExistingAnswerIfAny();
    }
  }, [
    handleCleanUpStates,
    handleGetExistingAnswerIfAny,
    loading,
    mountedRef,
    setLoading,
    setSwapPages,
  ]);

  useEffect(() => {
    debounce(() => handlePrepareNewPage());
  }, [
    page,
    handlePrepareNewPage,
    debounce,
    mountedRef,
    setLoading,
    setSwapPages,
  ]);

  const handleRouteChangeStart = useCallback(() => {
    setLoading(true);
    onChapterChange && onChapterChange();
  }, [onChapterChange, setLoading]);

  useEffect(() => {
    router.events.on("routeChangeStart", handleRouteChangeStart);
    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
    };
  }, [onChapterChange, router.events, handleRouteChangeStart]);

  const handleConvertPractice = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ id, answer: answerKey, placeholder, indent }: any) => {
      const accept = acceptRef.current;
      const answer = answerRef.current;

      if (!mountedRef.current[id]) {
        mountedRef.current[id] = true;

        let answerKeys = {};

        answerKeys = {
          ...answerKeys,
          [id]: answerKey,
        };

        if (solved !== false) {
          setPageStatus((prev) => ({
            ...prev,
            solved: false,
          }));
        }
        acceptRef.current = {
          ...acceptRef.current,
          ...answerKeys,
        };
      }

      return (
        <Input
          className={clsx(indent && "ml-14")}
          key={`InputBox-${id}`}
          id={`InputBox-${id}`}
          onBlur={onInputBlur}
          onChange={(e) => {
            const { value } = e.target as HTMLInputElement;
            const newAnswer = {
              ...answerRef.current,
              [id]: value === "" ? undefined : value,
            };
            answerRef.current = newAnswer;
            onAnswerUpdate && onAnswerUpdate(newAnswer);
          }}
          defaultValue={answer[id]}
          disabled={solved || inputIsDisabled}
          state={
            (submitted && solved) || inputIsDisabled
              ? userAnswerStatus(id)
              : undefined
          }
          placeholder={placeholder}
          helperText={
            inputIsDisabled && userAnswerStatus(id) === "error" ? (
              <>
                Answer: <b>{accept[id]}</b>
              </>
            ) : undefined
          }
        />
      );
    },
    [
      acceptRef,
      answerRef,
      inputIsDisabled,
      mountedRef,
      onAnswerUpdate,
      onInputBlur,
      setPageStatus,
      solved,
      submitted,
      userAnswerStatus,
    ]
  );
  const handleToggleOption = useCallback(
    (questionId: string, choiceId: number, value: boolean) => {
      if (solved) return;

      const prev = answerRef.current;
      const array = prev[questionId] ?? "";
      const newArray = array.split("");

      const newAnswer = {
        ...prev,
        [questionId]: prev[questionId]
          ? newArray
              .map((v, idx) => {
                if (idx !== choiceId) {
                  return v;
                }
                return value ? "1" : "0";
              })
              .join("")
          : prev[questionId],
      };

      answerRef.current = newAnswer;

      onAnswerUpdate && onAnswerUpdate(newAnswer);
    },
    [answerRef, onAnswerUpdate, solved]
  );

  const handleRenderOptionNew = useCallback(
    ({ id, options }: { id: string; options: [number, string][] }) => {
      const accept = acceptRef.current;
      const answer = answerRef.current;

      if (!mountedRef.current[id]) {
        mountedRef.current[id] = true;

        const acceptedString = options.map(([truth]) => truth).join("");
        const templateString = options.map(() => 0).join("");

        acceptRef.current = {
          ...accept,
          [id]: acceptedString,
        };

        answerRef.current = {
          ...answer,
          [id]: templateString,
        };

        onOptionsMount && onOptionsMount(id, templateString);
      }

      return (
        <>
          {options.map(([_, option], idx) => {
            const identifier = `Option-${id}-${idx}`;
            const parsed = option.replaceAll("\\{", "{").replaceAll("\\}", "}");
            const disabled = Boolean(solved || inputIsDisabled);

            const correct = Boolean(
              answer[id] &&
                accept[id] &&
                answer[id]?.at(idx) === accept[id].at(idx)
            );

            return (
              <Option
                key={identifier}
                id={identifier}
                content={parsed}
                selected={Boolean(answer[id] && answer[id]?.at(idx) === "1")}
                onSelect={(value) => {
                  if (disabled) return;

                  handleToggleOption(id, idx, value);
                }}
                correct={correct}
                disabled={disabled}
              />
            );
          })}
        </>
      );
    },
    [
      acceptRef,
      answerRef,
      handleToggleOption,
      inputIsDisabled,
      mountedRef,
      onOptionsMount,
      solved,
    ]
  );

  const handleRenderQuizQuestionHeading = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ id, ids, weight = "10" }: any) => {
      onQuestionMount &&
        onQuestionMount(id, {
          inputIds: ids.split(","),
          weight: Number(weight),
        });

      return (
        <Paragraph
          as="h2"
          id={`q${id}`}
          style={{
            marginTop: "-2rem",
            paddingTop: "2rem",
          }}
        >
          <Paragraph weight="bold">Question {id} </Paragraph>
          <Paragraph>[{weight} pts]</Paragraph>
        </Paragraph>
      );
    },
    [onQuestionMount]
  );

  const renderContent = useMemo(() => {
    return (
      <Content
        components={{
          Indent: ({ children }) => {
            return <div className="ml-8">{children}</div>;
          },
          TwoColumns: ({ children }) => {
            return (
              <div className="TwoColumns flex flex-wrap gap-4 w-fit mx-auto">
                {children}
              </div>
            );
          },
          Graph: (props) => {
            const { functions = "" } = props;
            const identifier = getId(functions);
            return (
              <Graph
                {...props}
                key={identifier}
                id={identifier}
                cache={mountedRef.current[identifier]}
                onReady={(cache) => {
                  mountedRef.current[identifier] = cache;
                }}
              />
            );
          },
          TeX,
          Practice: handleConvertPractice,
          Input: handleConvertPractice,
          Explanation: ({ children }) => (
            <>
              {solved && (
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
              <br />
              {children}
            </Blockquote>
          ),
          Theorem: ({ children, title }) => (
            <Blockquote variant="theorem">
              <Paragraph weight="bold">{title}</Paragraph>
              {children}
            </Blockquote>
          ),
          TexBlock: ({ children }) => {
            return <TeX block>{children}</TeX>;
          },
          Match: ({ id, left, right }) => (
            <div
              id={id}
              className="CustomMaterialInvoker hidden"
            >{`[match]@${id}@${left}@${right}`}</div>
          ),
          Option: () => <></>,
          Options: handleRenderOptionNew,
          Question: handleRenderQuizQuestionHeading,
        }}
      />
    );
  }, [
    Content,
    handleConvertPractice,
    handleRenderOptionNew,
    handleRenderQuizQuestionHeading,
    mountedRef,
    solved,
  ]);

  return (
    <CourseLayoutContentTemplate trueLoading={trueLoading}>
      {renderContent}
    </CourseLayoutContentTemplate>
  );
}

function getId(props: string) {
  // return encodeURIComponent(Object.values(props).join(""));
  return Buffer.from(Object.values(props).join(""), "utf8")
    .toString("base64")
    .replace(/([^\w]+|\s+)/g, "");
}
