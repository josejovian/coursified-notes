import React, {
  Fragment,
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
  MutableRefObject,
} from "react";
import {
  AnswerType,
  CUSTOM_MATERIAL,
  ChapterType,
  GraphElementType,
  InputBoxElementType,
  MatchBoxElementType,
  OptionElementType,
  QuizPhaseType,
  RequirementMap,
  RequirementType,
  SectionType,
  StateType,
} from "../type";
import { checkCourseProgress, getPracticeId } from "../utils";
import * as ReactDOM from "react-dom";
import { ReactElement } from "react-markdown/lib/react-markdown";
import { Option } from "../components/Courses/Entity/Option/CourseEntityOption";
import { Graph, Input, MatchBox } from "../components";

interface UseCustomProps {
  stateAnswer: StateType<Partial<AnswerType>>;
  stateActive: StateType<any>;
  stateSolved: StateType<number>;
  stateLoading: StateType<boolean>;
  stateAccept: StateType<AnswerType>;
  stateSubmitted: StateType<boolean>;
  inputRef: MutableRefObject<Record<string, boolean>>;
  inputIsDisabled?: boolean;
  handleCheckAnswer: (ans: string, id: string, flag?: boolean) => boolean;
}

export function useCustom({
  stateActive,
  stateAnswer,
  stateSolved,
  stateLoading,
  stateAccept,
  stateSubmitted,
  inputRef,
  inputIsDisabled,
  handleCheckAnswer,
}: UseCustomProps) {
  const [active, setActive] = stateActive;
  const [answer, setAnswer] = stateAnswer;
  const [solved, setSolved] = stateSolved;
  const [loading, setLoading] = stateLoading;
  const [accept, setAccept] = stateAccept;
  const [submitted, setSubmitted] = stateSubmitted;

  const answerInputBoxParentElement = useRef<InputBoxElementType[]>([]);
  const matchParentElement = useRef<MatchBoxElementType[]>([]);
  const optionParentElement = useRef<OptionElementType[]>([]);
  const graphParentElement = useRef<GraphElementType[]>([]);
  const optionCount = useRef<Record<string, number>>({});
  const optionDict = useRef<Record<string, string[]>>({});
  const optionRendered = useRef<Record<string, boolean>>({});
  const matchRef = useRef<
    Record<
      string,
      {
        left: string;
        right: string;
        ready?: boolean;
      }
    >
  >({});
  const graphRef = useRef<Record<string, string>>({});

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

  const renderCustomElement = useCallback(
    (
      parentElement: HTMLElement,
      targetElement: ReactElement,
      group: string,
      id: string
    ) => {
      const identifier = `${group}-${id}`;

      if (document.getElementById(identifier)) return;

      const vessel = document.createElement("div");
      vessel.id = `${group}-${id}`;
      vessel.classList.add(group);

      const elm = document.getElementById(id);

      if (elm) {
        elm.className = "";
        elm.appendChild(vessel);

        ReactDOM.render(targetElement, elm);
      }
    },
    []
  );

  const handleOnePairMatch = useCallback(() => {
    if (active && active.type === "complete") {
      setAnswer((prev) => ({
        ...prev,
        [active.id]: active.answer,
      }));
      setActive(null);
    }
  }, [active, setActive, setAnswer]);

  const handleToggleOption = useCallback(
    (questionId: string, choiceId: number) => {
      if (solved) return;

      setAnswer((prev) => {
        const array = prev[questionId] ?? "";
        const newArray = array.split("");

        // console.log("ID: ", choiceId);

        // if (newArray.length === choiceId) {
        //   console.log("ChoiceID: ", choiceId);
        //   newArray[choiceId] = "0";
        // }

        return {
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
      });
    },
    [setAnswer, solved]
  );

  const handleSetActive = useCallback(
    (type: "target" | "source", content: string, override: boolean = false) => {
      setActive((prev: any) => {
        if (!prev || override) {
          return type === "target"
            ? {
                id: content,
                type: "target",
              }
            : {
                answer: content,
                type: "source",
              };
        }
        if (type === "target" && prev.type === "source") {
          return {
            id: content,
            answer: prev.answer,
            type: "complete",
          };
        } else if (type === "source" && prev.type === "target") {
          return {
            id: prev.id,
            answer: content,
            type: "complete",
          };
        } else {
          return null;
        }
      });
    },
    [setActive]
  );

  const handleRemoveCustomComponents = useCallback((className: string) => {
    const previousRenders = document.querySelectorAll(`.${className}`);
    matchRef.current = {};
    previousRenders.forEach((element) => {
      /** @todos Something MIGHT be wrong with this unmount method. */
      try {
        element.parentElement && element.parentElement.removeChild(element);
      } catch (e) {}
    });
  }, []);

  const handleRemoveAllCustomComponents = useCallback(() => {
    // Object.entries(customElementQueue.current).forEach(([key, _]) => {
    //   JXG.JSXGraph.freeBoard(key);
    // });
    optionDict.current = {};
    optionCount.current = {};
    optionParentElement.current = [];

    Object.values(CUSTOM_MATERIAL).forEach((group) => {
      handleRemoveCustomComponents(group);
    });

    inputRef.current = {};
  }, [handleRemoveCustomComponents, inputRef, optionCount, optionDict]);

  const handleRemoveAnswer = useCallback(
    (key: string) => {
      setAnswer((prev) => ({
        ...prev,
        [key]: undefined,
      }));
    },
    [setAnswer]
  );

  const handleCheckIfAlreadyMatched = useCallback(
    (
      currentKey: any,
      currentAnswer: any,
      onKeyMatch: null | ((key: string) => void),
      onValueMatch: null | ((key: string) => void)
    ) => {
      if (solved === 1) return;
      Object.entries(answer).forEach(([key, value]) => {
        if (onKeyMatch && key === currentKey) {
          onKeyMatch(key);
        } else if (onValueMatch && value === currentAnswer) {
          onValueMatch(key);
        }
      });
    },
    [answer, solved]
  );

  const handleClickMatchedCard = useCallback(
    (practiceId: string) =>
      handleCheckIfAlreadyMatched(practiceId, null, handleRemoveAnswer, null),
    [handleCheckIfAlreadyMatched, handleRemoveAnswer]
  );

  const handleClickDrop = useCallback(
    (practiceId: string) => {
      let terminate = false;

      handleCheckIfAlreadyMatched(
        practiceId,
        null,
        (key: string) => {
          handleRemoveAnswer(key);
          terminate = true;
        },
        null
      );

      if (active && active.type === "target") {
        if (active.id === practiceId) {
          setActive(null);
        } else {
          handleSetActive("target", practiceId, true);
        }
        terminate = true;
      }

      if (terminate) return;

      handleSetActive("target", practiceId);
    },
    [
      active,
      handleCheckIfAlreadyMatched,
      handleRemoveAnswer,
      handleSetActive,
      setActive,
    ]
  );

  const handleClickUnmatchedCard = useCallback(
    (right: string) => {
      let terminate = false;

      handleCheckIfAlreadyMatched(null, right, null, (key: string) => {
        handleRemoveAnswer(key);

        if (active && active.id) setActive(null);
        terminate = true;
      });

      if (active && active.type === "source") {
        if (active.answer === right) {
          setActive(null);
        } else {
          handleSetActive("source", right, true);
        }
        terminate = true;
      }
      if (terminate) return;

      handleSetActive("source", right);
    },
    [
      active,
      handleCheckIfAlreadyMatched,
      handleRemoveAnswer,
      handleSetActive,
      setActive,
    ]
  );

  const renderOption = useCallback(
    (
      practiceId: string,
      choiceId: number,
      content: string,
      value?: boolean
    ) => {
      const identifier = `Option-${practiceId}-${choiceId}`;
      const parsed = content.replaceAll("\\{", "{").replaceAll("\\}", "}");
      const disabled = Boolean(solved || inputIsDisabled);

      const correct = Boolean(
        answer[practiceId] &&
          accept[practiceId] &&
          answer[practiceId]?.at(choiceId) === accept[practiceId].at(choiceId)
      );

      console.log(answer);

      return (
        <Option
          id={identifier}
          content={parsed}
          selected={Boolean(
            value ||
              (answer[practiceId] && answer[practiceId]?.at(choiceId) === "1")
          )}
          onSelect={() => {
            if (disabled) return;

            handleToggleOption(practiceId, choiceId);
          }}
          correct={correct}
          disabled={disabled}
        />
      );
    },
    [accept, answer, handleToggleOption, inputIsDisabled, solved]
  );

  const renderMatchBox = useCallback(
    (practiceId: string, left: string, right: string) => {
      const identifier = `MatchBox-${practiceId}`;

      //.replaceAll("\\{", "{").replaceAll("\\}", "}")
      if (!matchRef.current[practiceId])
        matchRef.current[practiceId] = {
          left: left.replaceAll("\\{", "{").replaceAll("\\}", "}"),
          right: right.replaceAll("\\{", "{").replaceAll("\\}", "}"),
          ready: true,
        };

      return (
        <MatchBox
          // key={identifier}
          id={identifier}
          practiceId={practiceId}
          active={active}
          answer={answer}
          solved={solved}
          left={matchRef.current[practiceId].left}
          right={matchRef.current[practiceId].right}
          handleClickMatchedCard={() => handleClickMatchedCard(practiceId)}
          handleClickDrop={() => handleClickDrop(practiceId)}
          handleClickUnmatchedCard={() => handleClickUnmatchedCard(right)}
        />
      );
    },
    [
      active,
      answer,
      handleClickDrop,
      handleClickMatchedCard,
      handleClickUnmatchedCard,
      solved,
    ]
  );

  const renderAnswerBox = useCallback(
    (practiceId: string) => (
      <Input
        key={`InputBox-${practiceId}`}
        id={`InputBox-${practiceId}`}
        onBlur={(e) => {
          if (answer !== accept) {
            setSubmitted(false);
            setAnswer((prev) => ({
              ...prev,
              [practiceId]: e.target.value,
            }));
          }
        }}
        defaultValue={answer[practiceId]}
        disabled={
          solved === 1 ||
          userAnswerStatus(practiceId) === "success" ||
          inputIsDisabled
        }
        color="danger"
        state={submitted ? userAnswerStatus(practiceId) : undefined}
      />
    ),
    [
      answer,
      solved,
      userAnswerStatus,
      inputIsDisabled,
      submitted,
      accept,
      setSubmitted,
      setAnswer,
    ]
  );

  const renderGraph = useCallback(
    ({
      id,
      functions,
      points,
      ranges,
      asymptotes,
      gridSize,
    }: {
      id: string;
      functions: string;
      points: string;
      ranges: string;
      asymptotes: string;
      gridSize: string;
    }) => {
      return (
        <Graph
          key={id}
          id={id}
          functions={functions}
          points={points}
          ranges={ranges}
          asymptotes={asymptotes}
          gridSize={gridSize as any}
          cache={graphRef.current[id]}
          onReady={(data) => {
            graphRef.current[id] = data;
          }}
        />
      );
    },
    []
  );

  const handleRenderAnswerBoxes = useCallback(() => {
    handleRemoveCustomComponents("InputBox");

    answerInputBoxParentElement.current.forEach(({ parentElement, string }) => {
      const currentId = getPracticeId(string);
      if (currentId) {
        renderCustomElement(
          parentElement,
          renderAnswerBox(currentId),
          CUSTOM_MATERIAL["input"],
          currentId
        );
      }
    });
  }, [handleRemoveCustomComponents, renderAnswerBox, renderCustomElement]);

  const handleRenderMatch = useCallback(() => {
    handleRemoveCustomComponents("MatchBox");

    matchParentElement.current.forEach(({ parentElement, pair, id }) => {
      const left = pair[0];
      const right = pair[1];
      renderCustomElement(
        parentElement,
        renderMatchBox(id, left, right),
        CUSTOM_MATERIAL["match"],
        id
      );
    });
  }, [handleRemoveCustomComponents, renderCustomElement, renderMatchBox]);

  const handleRenderOptions = useCallback(() => {
    handleRemoveCustomComponents("Option");

    optionParentElement.current.forEach(
      ({ parentElement, content, id, choiceIndex }) => {
        const identifier = `${id}-${choiceIndex}`;
        optionRendered.current[id] = true;
        renderCustomElement(
          parentElement,
          renderOption(id, choiceIndex, content),
          CUSTOM_MATERIAL["option"],
          identifier
        );
      }
    );
  }, [handleRemoveCustomComponents, renderCustomElement, renderOption]);

  /*
  const handleRenderGraph = useCallback(() => {
    handleRemoveCustomComponents("GraphContainer");

    graphParentElement.current.forEach(
      ({
        parentElement,
        id,
        functions,
        points,
        ranges,
        asymptotes,
        gridSize,
      }) => {
        console.warn(functions);
        console.warn(points);
        console.warn(ranges);
        renderCustomElement(
          parentElement,
          renderGraph({
            id,
            functions,
            points,
            ranges,
            asymptotes,
            gridSize,
          }),
          CUSTOM_MATERIAL["graph"],
          id
        );
      }
    );
  }, [handleRemoveCustomComponents, renderCustomElement, renderGraph]);
*/

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

  const handleConvertCodeToComponents = useCallback(() => {
    if (!loading) return;

    const container = document.getElementsByClassName(
      "CourseMaterial_wrapper"
    )[0];

    handleRemoveAllCustomComponents();

    const elements = document.querySelectorAll(
      ".CourseMaterial_content .CustomMaterialInvoker"
    );

    let inputElementsRendered = 0;

    let answerKeys: Record<string, string> = {};

    answerInputBoxParentElement.current = [];
    matchParentElement.current = [];
    graphParentElement.current = [];

    let tempOptionDict: Record<string, string[]> = optionDict.current;
    let tempOptionCount: Record<string, number> = optionCount.current;

    elements.forEach((element, index) => {
      const string = element.innerHTML;
      const parentElement = element.parentElement;

      if (container && parentElement && string.match(/\<Practice/g)) {
        const detectedPair = string.toString().split("@");

        if (detectedPair && detectedPair.length === 4) {
          const [tag, id, left, right] = detectedPair;
          const vessel = document.getElementById(id)!;

          matchParentElement.current = [
            ...matchParentElement.current,
            {
              parentElement: vessel,
              pair: [left, right],
              id,
            },
          ];

          answerKeys = {
            ...answerKeys,
            [id]: `${right}`,
          };

          inputElementsRendered++;
        }
      }

      if (container && parentElement && string.match(/\[match\]/g)) {
        const detectedPair = string.toString().split("@");

        if (detectedPair && detectedPair.length === 4) {
          const [tag, id, left, right] = detectedPair;
          const vessel = document.getElementById(id)!;

          matchParentElement.current = [
            ...matchParentElement.current,
            {
              parentElement: vessel,
              pair: [left, right],
              id,
            },
          ];

          answerKeys = {
            ...answerKeys,
            [id]: `${right}`,
          };

          inputElementsRendered++;
        }
      }

      if (container && parentElement && string.match(/\[option\]/g)) {
        const detectedPair = string.toString().split("@");

        if (detectedPair && detectedPair.length === 5) {
          const [tag, id, index, content, truth] = detectedPair;

          let existingCount = tempOptionCount[id] ?? 0;
          let existingDict = tempOptionDict[id] ?? [];
          let index2 = existingDict.findIndex((value) => value === content);

          if (index2 === -1) {
            index2 = existingDict.length;
            existingDict.push(content);
            tempOptionCount[id] = existingCount + 1;
            tempOptionDict[id] = existingDict;
          }

          const vessel = document.getElementById(`${id}-${index}`)!;

          optionParentElement.current = [
            ...optionParentElement.current,
            {
              parentElement: vessel,
              content,
              id,
              truth: Number(truth),
              choiceIndex: Number(index),
            },
          ];
        }
      }

      if (container && parentElement && string.match(/\[graph/g)) {
        const detectedPair = string.toString().split("@");

        if (detectedPair && detectedPair.length >= 3) {
          console.error(detectedPair);
          const [tag, id, functions, points, ranges, asymptotes, gridSize] =
            detectedPair;

          const vessel = document.getElementById(id)!;

          graphParentElement.current = [
            ...graphParentElement.current,
            {
              parentElement: vessel,
              id,
              functions,
              points,
              ranges,
              asymptotes,
              gridSize,
            },
          ];
        }
      }
    });

    // Object.entries(customElementQueue.current).forEach(
    //   ([key, { containerId, element, props }]) => {
    //     const target = document.getElementById(containerId);
    //     if (target)
    //       renderCustomElement(
    //         target,
    //         <div className="GraphContainer">
    //           <Graph id={key} {...props} />
    //         </div>,
    //         CUSTOM_MATERIAL["graph"],
    //         key
    //       );
    //   }
    // );

    if (matchParentElement.current.length > 0 && solved !== 1) {
      matchParentElement.current.sort(() => Math.random() - 0.5);
      let randomizedPairs = matchParentElement.current.map(({ pair }) => {
        return pair[1];
      });

      randomizedPairs.sort(() => Math.random() - 0.5);
      matchParentElement.current = matchParentElement.current.map(
        (parent, idx: number) => ({
          ...parent,
          pair: [parent.pair[0], randomizedPairs[idx]],
        })
      );
    }

    optionCount.current = tempOptionCount;
    optionDict.current = tempOptionDict;

    if (optionParentElement.current.length > 0 && solved !== 1) {
      let optionAnswerKeys: Record<string, string> = {};
      let optionDefaultAnswer: Record<string, string> = {};

      optionParentElement.current.forEach((option) => {
        const { choiceIndex } = option;
        let relevantKey = optionAnswerKeys[option.id];

        if (relevantKey) {
          relevantKey = relevantKey
            .split("")
            .map((value, idx2) =>
              idx2 === choiceIndex ? String(option.truth) : value
            )
            .join("");
        } else {
          const array = Array.from(
            { length: optionCount.current[option.id] },
            () => "0"
          );
          optionDefaultAnswer[option.id] = array.join("");
          relevantKey = array
            .map((v, idx2) => (idx2 === choiceIndex ? option.truth : "0"))
            .join("");
        }
        optionAnswerKeys[option.id] = relevantKey;

        // newAnswerKey.split('').map((value, idx2) => idx2 === optionIndex)

        answerKeys = {
          ...answerKeys,
          [option.id]: relevantKey,
        };
      });

      // if (!solved) optionParentElement.current.sort(() => Math.random() - 0.5);

      // const defaultTruth = optionParentElement.current
      //   .map((option) => option.id)
      //   .reduce(
      //     (prev, curr) => ({
      //       ...prev,
      //       [curr]: "0",
      //     }),
      //     {}
      //   );

      console.log("generated answer keys: ", answerKeys);

      setAccept((prev) => ({
        ...prev,
        ...answerKeys,
      }));
      if (!submitted)
        setAnswer((prev) => ({
          ...prev,
          ...optionDefaultAnswer,
        }));

      inputElementsRendered += Object.keys(optionAnswerKeys).length;
    }

    if (inputElementsRendered > 0 && Object.values(answerKeys).length > 0) {
      setSolved(0);
      setAccept((prev) => ({
        ...prev,
        ...answerKeys,
      }));
      handleRenderAnswerBoxes();
      handleRenderMatch();
      handleRenderOptions();
    }
    // handleRenderGraph();
  }, [
    loading,
    handleRemoveAllCustomComponents,
    solved,
    setAccept,
    submitted,
    setAnswer,
    setSolved,
    handleRenderAnswerBoxes,
    handleRenderMatch,
    handleRenderOptions,
  ]);

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

  return useMemo(
    () => ({
      handleOnePairMatch,
      handleRenderAnswerBoxes,
      handleRenderMatch,
      handleRenderOptions,
      // handleRenderGraph,
      handleRemoveAllCustomComponents,
      handleConvertCodeToComponents,
    }),
    [
      handleConvertCodeToComponents,
      handleOnePairMatch,
      handleRemoveAllCustomComponents,
      handleRenderAnswerBoxes,
      // handleRenderGraph,
      handleRenderMatch,
      handleRenderOptions,
    ]
  );
}
