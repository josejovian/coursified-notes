import clsx from "clsx";
import React, {
  useCallback,
  useState,
  useRef,
  useMemo,
  useEffect,
  MutableRefObject,
} from "react";
import { getMDXComponent } from "mdx-bundler/client";
import TeX from "@matejmazur/react-katex";
import {
  AddressesType,
  AnswerType,
  QuizPhaseType,
  QuizQuestionType,
  StateType,
} from "@/src/type";
import { checkChapterProgress } from "@/src/utils";
import { Blockquote, Graph, Input, Loader, Paragraph } from "@/src/components";
import { useRouter } from "next/router";
import { useCustom } from "@/src/hooks";
import { CourseLayoutContentTemplate } from "./CourseLayoutContentTemplate";
import { Option } from "../Entity/Option/CourseEntityOption";

interface CourseMaterialContentProps {
  markdown: any;
  addreses: AddressesType;
  stateSolved: StateType<number>;
  answerRef: MutableRefObject<Partial<AnswerType>>;
  acceptRef: MutableRefObject<AnswerType>;
  stateLoading: StateType<boolean>;
  stateChecking: StateType<boolean>;
  stateSubmitted: StateType<boolean>;
  statePage: StateType<number>;
  trueLoading: boolean;
  quizQuestions?: MutableRefObject<Record<string, QuizQuestionType>>;
  handleCheckAnswer: (ans: string, id: string, flag?: boolean) => boolean;
  onChapterChange?: () => void;
  inputIsDisabled?: boolean;
}

export function CourseLayoutMain({
  markdown,
  addreses,
  acceptRef,
  answerRef,
  stateChecking,
  stateSolved,
  stateLoading,
  stateSubmitted,
  statePage,
  trueLoading,
  quizQuestions,
  handleCheckAnswer,
  onChapterChange,
  inputIsDisabled,
}: CourseMaterialContentProps) {
  const router = useRouter();
  const checking = stateChecking[0];
  const [loading, setLoading] = stateLoading;
  const [solved, setSolved] = stateSolved;
  const [submitted, setSubmmited] = stateSubmitted;
  const stateActive = useState<any>(null);
  const active = stateActive[0];
  const inputRef = useRef<Record<string, boolean>>({});
  const graphRef = useRef<Record<string, string>>({});
  const optionCount = useRef<Record<string, number>>({});
  const optionDict = useRef<Record<string, string[]>>({});
  const page = statePage[0];
  const answer = answerRef.current;
  const accept = acceptRef.current;

  const { practice } = addreses;

  const Content = useMemo(() => {
    return getMDXComponent(markdown);
  }, [markdown]);

  const userAnswerStatus = useCallback(
    (practiceId: string) => {
      const specificAnswer = answer[practiceId];
      return specificAnswer &&
        handleCheckAnswer(specificAnswer, practiceId, false)
        ? "success"
        : "error";
    },
    [answer, handleCheckAnswer]
  );

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
      answerRef.current = newAnswer;
    }
  }, [answer, answerRef]);

  useEffect(() => {
    handleRemoveUndefinedAnswers();
  }, [answer, handleRemoveUndefinedAnswers]);

  const handleGetExistingAnswerIfAny = useCallback(() => {
    const existingAnswers = checkChapterProgress(practice);
    const practiceIds = Object.keys(accept);

    if (practiceIds.length === 0) return;

    console.log("Eixisting Answers: ", existingAnswers);

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
      setSubmmited(true);
      setSolved(1);
    }
  }, [practice, accept, handleCheckAnswer, answerRef, setSubmmited, setSolved]);

  useEffect(() => {
    handleGetExistingAnswerIfAny();
  }, [loading, handleGetExistingAnswerIfAny]);

  const handlePrepareNewPage = useCallback(() => {
    if (loading) {
      graphRef.current = {};
      inputRef.current = {};

      setLoading(false);
    }
  }, [loading, setLoading]);

  useEffect(() => {
    handlePrepareNewPage();
  }, [page, handlePrepareNewPage]);

  const handleRouteChangeStart = useCallback(() => {
    setLoading(true);
    onChapterChange && onChapterChange();
  }, [onChapterChange, setLoading]);

  useEffect(() => {
    router.events.on("routeChangeStart", handleRouteChangeStart);
    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
    };
  }, [
    onChapterChange,
    handlePrepareNewPage,
    router.events,
    handleRouteChangeStart,
  ]);

  const handleConvertPractice = useCallback(
    ({ id, answer: answerKey, placeholder, indent }: any) => {
      if (!inputRef.current[id]) {
        inputRef.current[id] = true;

        let answerKeys = {};

        answerKeys = {
          ...answerKeys,
          [id]: answerKey,
        };

        setSolved(0);
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
          onBlur={() => {
            setSubmmited(false);
          }}
          onChange={(e) => {
            const { value } = e.target as HTMLInputElement;

            answerRef.current = {
              ...answerRef.current,
              [id]: value === "" ? undefined : value,
            };
          }}
          defaultValue={answer[id]}
          disabled={solved === 1 || inputIsDisabled}
          state={
            (submitted && solved) || inputIsDisabled
              ? userAnswerStatus(id)
              : undefined
          }
          mounted={inputRef.current[id]}
          onMount={() => {}}
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
      accept,
      acceptRef,
      answer,
      answerRef,
      inputIsDisabled,
      setSolved,
      setSubmmited,
      solved,
      submitted,
      userAnswerStatus,
    ]
  );
  const handleToggleOption = useCallback(
    (questionId: string, choiceId: number) => {
      if (solved) return;

      const prev = answerRef.current;
      const array = prev[questionId] ?? "";
      const newArray = array.split("");

      answerRef.current = {
        ...prev,
        [questionId]: prev[questionId]
          ? newArray
              .map((v, idx) => {
                if (idx !== choiceId) {
                  return v;
                }
                return v === "1" ? "0" : "1";
              })
              .join("")
          : prev[questionId],
      };
    },
    [answerRef, solved]
  );

  const handleRenderOptionNew = useCallback(
    ({ id, options }: { id: string; options: [number, string][] }) => {
      acceptRef.current = {
        ...acceptRef.current,
        [id]: options.map(([truth]) => truth).join(""),
      };

      if (!answer[id]) {
        answerRef.current = {
          ...answerRef.current,
          [id]: options.map(() => 0).join(""),
        };
      }

      return (
        <>
          {options.map(([truth, option], idx) => {
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
                onSelect={() => {
                  if (disabled) return;

                  handleToggleOption(id, idx);
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
      accept,
      acceptRef,
      answer,
      answerRef,
      handleToggleOption,
      inputIsDisabled,
      solved,
    ]
  );

  const handleRenderQuizQuestionHeading = useCallback(
    ({ id, ids, weight = "10" }: any) => {
      if (!quizQuestions) return <></>;

      quizQuestions.current[id] = {
        inputIds: ids.split(","),
        weight: Number(weight),
      };

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
    [quizQuestions]
  );

  const renderContent = useMemo(
    () => (
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
                cache={graphRef.current[identifier]}
                onReady={(cache) => {
                  graphRef.current[identifier] = cache;
                }}
              />
            );
          },
          TeX,
          Practice: handleConvertPractice,
          Input: handleConvertPractice,
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
    ),
    [
      Content,
      handleConvertPractice,
      handleRenderOptionNew,
      handleRenderQuizQuestionHeading,
      solved,
    ]
  );

  return (
    <CourseLayoutContentTemplate trueLoading={trueLoading}>
      {renderContent}
    </CourseLayoutContentTemplate>
  );
}

function getId(props: any) {
  // return encodeURIComponent(Object.values(props).join(""));
  return Buffer.from(Object.values(props).join(""), "utf8")
    .toString("base64")
    .replace(/([^\w]+|\s+)/g, "");
}
