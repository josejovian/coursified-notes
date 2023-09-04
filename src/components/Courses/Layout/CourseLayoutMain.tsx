import clsx from "clsx";
import React, {
  useCallback,
  useState,
  useRef,
  useMemo,
  useEffect,
} from "react";
import { getMDXComponent } from "mdx-bundler/client";
import TeX from "@matejmazur/react-katex";
import { AddressesType, AnswerType, StateType } from "@/src/type";
import { checkChapterProgress } from "@/src/utils";
import { Blockquote, Graph, Input, Loader, Paragraph } from "@/src/components";
import { useRouter } from "next/router";
import { useCustom } from "@/src/hooks";
import { CourseLayoutContentTemplate } from "./CourseLayoutContentTemplate";

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
  stateChecking,
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
  const checking = stateChecking[0];
  const [loading, setLoading] = stateLoading;
  const [answer, setAnswer] = stateAnswer;
  const [accept, setAccept] = stateAccept;
  const [solved, setSolved] = stateSolved;
  const [submitted, setSubmmited] = stateSubmitted;
  const stateActive = useState<any>(null);
  const active = stateActive[0];
  const inputRef = useRef<Record<string, boolean>>({});
  const graphRef = useRef<Record<string, string>>({});
  const optionCount = useRef<Record<string, number>>({});
  const optionDict = useRef<Record<string, string[]>>({});

  const [executed, setExecuted] = useState(0);

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

  const Content = useMemo(() => {
    return getMDXComponent(markdown);
  }, [markdown]);

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
    submitted,
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
      graphRef.current = {};
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

  const handleConvertPractice = useCallback(
    ({ id, answer: answerKey, placeholder, indent }: any) => {
      return (
        <Input
          className={clsx(indent && "ml-14")}
          key={`InputBox-${id}`}
          id={`InputBox-${id}`}
          onBlur={(e) => {
            const { value } = e.target;

            if (value !== "" && answer[id] !== value) {
              setSubmmited(false);
              setAnswer((prev) => ({
                ...prev,
                [id]: e.target.value,
              }));
            }
          }}
          defaultValue={answer[id]}
          disabled={solved === 1}
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
            setAccept((prev) => ({
              ...prev,
              ...answerKeys,
            }));
          }}
          placeholder={placeholder}
        />
      );
    },
    [
      answer,
      setAccept,
      setAnswer,
      setSolved,
      setSubmmited,
      solved,
      submitted,
      userAnswerStatus,
    ]
  );

  const handleRenderOption = useCallback(({ id, content, truth }: any) => {
    let existingCount = optionCount.current[id] ?? 0;
    let existingDict = optionDict.current[id] ?? [];
    let index = existingDict.findIndex((value) => value === content);
    if (index === -1) {
      index = existingDict.length;
      existingDict.push(content);
      optionCount.current[id] = existingCount + 1;
      optionDict.current[id] = existingDict;
    }

    console.log(`Rerendering: ${id}-${index}`);

    const identifier = `${id}-${index}`;

    return (
      <div
        id={identifier}
        className="CustomMaterialInvoker hidden"
      >{`[option]@${id}@${index}@${content}@${truth ? 1 : 0}`}</div>
    );
  }, []);

  return (
    <CourseLayoutContentTemplate trueLoading={trueLoading}>
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
          Option: handleRenderOption,
        }}
      />
    </CourseLayoutContentTemplate>
  );
}

function getId(props: any) {
  // return encodeURIComponent(Object.values(props).join(""));
  return Buffer.from(Object.values(props).join(""), "utf8")
    .toString("base64")
    .replace(/([^\w]+|\s+)/g, "");
}
