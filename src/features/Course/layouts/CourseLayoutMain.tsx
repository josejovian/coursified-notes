import React, {
  useCallback,
  useRef,
  useMemo,
  useEffect,
  MutableRefObject,
} from "react";
import clsx from "clsx";
import { useRouter } from "next/router";
import { getMDXComponent } from "mdx-bundler/client";
import TeX from "@matejmazur/react-katex";
import { Blockquote, Input, Paragraph } from "@/components/Basic";
import { checkChapterProgress } from "@/utils";
import { AddressesType, AnswerType, QuizQuestionType, StateType } from "@/type";
import { CourseLayoutContentTemplate } from "./CourseLayoutContentTemplate";
import { Option, Graph } from "../components/CourseEntity";

interface CourseMaterialContentProps {
  markdown: string;
  addreses: AddressesType;
  stateSolved: StateType<number>;
  answerRef: MutableRefObject<Partial<AnswerType>>;
  acceptRef: MutableRefObject<AnswerType>;
  mountedRef: MutableRefObject<Record<string, boolean>>;
  stateLoading: StateType<boolean>;
  stateChecking: StateType<boolean>;
  stateSubmitted: StateType<boolean>;
  statePage: StateType<number>;
  trueLoading: boolean;
  handleCheckAnswer: (ans: string, id: string, flag?: boolean) => boolean;
  onChapterChange?: () => void;
  onAnswerUpdate?: (answer: Partial<AnswerType>) => void;
  onQuestionMount?: (id: string, question: QuizQuestionType) => void;
  onOptionsMount?: (id: string, answer: string) => void;
  inputIsDisabled?: boolean;
}

export function CourseLayoutMain({
  markdown,
  addreses,
  acceptRef,
  answerRef,
  mountedRef,
  stateSolved,
  stateLoading,
  stateSubmitted,
  statePage,
  trueLoading,
  handleCheckAnswer,
  onChapterChange,
  onAnswerUpdate,
  onQuestionMount,
  onOptionsMount,
  inputIsDisabled,
}: CourseMaterialContentProps) {
  const router = useRouter();
  const [loading, setLoading] = stateLoading;
  const [solved, setSolved] = stateSolved;
  const [submitted, setSubmmited] = stateSubmitted;
  const inputRef = useRef<Record<string, boolean>>({});
  const graphRef = useRef<Record<string, string>>({});
  const page = statePage[0];
  const accept = acceptRef.current;

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
      mountedRef.current = {};

      setLoading(false);
    }
  }, [loading, mountedRef, setLoading]);

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

        if (solved !== 0) setSolved(0);
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
            const newAnswer = {
              ...answerRef.current,
              [id]: value === "" ? undefined : value,
            };
            answerRef.current = newAnswer;
            onAnswerUpdate && onAnswerUpdate(newAnswer);
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
      acceptRef,
      answerRef,
      inputIsDisabled,
      mountedRef,
      onAnswerUpdate,
      setSolved,
      setSubmmited,
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
    );
  }, [
    Content,
    handleConvertPractice,
    handleRenderOptionNew,
    handleRenderQuizQuestionHeading,
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
