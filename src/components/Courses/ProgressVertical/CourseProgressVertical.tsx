import { useEffect, useState, useCallback, ReactNode } from "react";
import { BsCheckLg } from "react-icons/bs";
import clsx from "clsx";
import { CourseProgressVerticalMilestone } from "@/src/components";

interface CourseProgressVerticalProps {
  title: string;
  milestones: string[];
  captions?: ReactNode[];
  indexTemplate?: (x: number) => string;
  progress?: number;
  stylings?: string[];
  links?: string[];
}

const COMPLETE_COLOR = "var(--gradient-2)";
const INCOMPLETE_COLOR = "rgba(212, 212, 212, 1)";
const CIRCLE_TOP_OFFSET = 50;
const CIRCLE_SIZE = 32;
const CIRCLE_LEFT_OFFSET = -57.6;
const DEACCELERATION_THRESHOLD = 1;

export function CourseProgressVertical({
  title,
  milestones = [],
  captions,
  indexTemplate = () => "",
  progress = 0,
  stylings,
  links,
}: CourseProgressVerticalProps) {
  const [target, setTarget] = useState(0);
  const [floorIndex, setFloorIndex] = useState<[number, number][]>([]);
  const [step, setStep] = useState(0);
  const [adjusted, setAdjusted] = useState(false);

  const handleGetIndexFromThreshold = useCallback(
    (targetCurrent: number) => {
      let out = 0;
      floorIndex.forEach((unused, index) => {
        if (
          index + 1 < floorIndex.length &&
          targetCurrent < floorIndex[index + 1][1] &&
          targetCurrent >= floorIndex[index][0]
        ) {
          out = index;
        }
      });
      return out;
    },
    [floorIndex]
  );

  const handleGetChapterElements = useCallback(
    (index: number) => {
      const chapterElement = document.getElementById(
        `Progress_${title}-${milestones[index]}`
      );
      const chapterLineElement = document.getElementById(
        `Progress_${title}-${milestones[index]}-line`
      );
      const chapterCircleElement = document.getElementById(
        `Progress_${title}-${milestones[index]}-circle`
      );
      const nextChapterElement = document.getElementById(
        `Progress_${title}-${milestones[index + 1]}`
      );

      if (chapterElement && chapterLineElement && chapterCircleElement) {
        const base: any[] = [
          chapterElement,
          chapterLineElement,
          chapterCircleElement,
          nextChapterElement,
        ];
        return base;
      }

      return null;
    },
    [milestones, title]
  );

  const handleCalculateProgressToBeAdded = useCallback(
    (
      targetCurrent: number,
      goal: number,
      iteration: number,
      peak: [number, number] = [-1, -1]
    ) => {
      const currentAnimatedIndex = handleGetIndexFromThreshold(targetCurrent);
      const chapterElements = handleGetChapterElements(currentAnimatedIndex);

      const chapterLineElement =
        chapterElements && (chapterElements[1] as HTMLElement);

      let heightFactor = 1;
      if (chapterLineElement) {
        heightFactor = 32 / (parseInt(chapterLineElement.style.height) + 0.001);
      }

      const magnitude =
        Math.ceil(
          targetCurrent / goal <= DEACCELERATION_THRESHOLD
            ? iteration
            : Math.max(-iteration + 2 * peak[1], 0)
        ) / 50;
      const multiplierRange =
        floorIndex[currentAnimatedIndex] &&
        targetCurrent > floorIndex[currentAnimatedIndex][1]
          ? heightFactor
          : 1;

      const absoluteProgress = multiplierRange * magnitude;
      const addedProgress = absoluteProgress;

      const next = targetCurrent + addedProgress;

      return [
        Math.min(next, goal),
        targetCurrent / goal <= DEACCELERATION_THRESHOLD ? magnitude : 1,
      ];
    },
    [handleGetIndexFromThreshold, handleGetChapterElements, floorIndex]
  );

  const handleAnimate = useCallback(
    (
      current: number,
      iteration: number,
      previousPeak: [number, number] = [-1, -1]
    ) => {
      const goal = target;
      let peak: [number, number] = previousPeak;

      if (current < goal) {
        setTimeout(() => {
          const [next, magnitude] = handleCalculateProgressToBeAdded(
            current,
            goal,
            iteration,
            peak
          );
          if (magnitude > peak[0] && next <= goal / 2)
            peak = [magnitude, iteration];

          setStep(next);
          if (next < goal) handleAnimate(next, iteration + 1, peak);
        }, 1);
      }
    },
    [target, handleCalculateProgressToBeAdded]
  );

  const handleSizeAdjustment = useCallback(() => {
    let totalHeight = 0;
    let thresholds: [number, number][] = [];

    milestones.forEach((chapter, index) => {
      const chapterElements = handleGetChapterElements(index);
      if (chapterElements) {
        const [
          chapterElement,
          chapterLineElement,
          chapterCircleElement,
          nextChapterElement,
        ] = chapterElements;
        const chapterHeight = chapterElement.offsetHeight;
        const chapterCircleHeight = chapterCircleElement.offsetHeight;
        chapterLineElement.style.top =
          CIRCLE_TOP_OFFSET + chapterCircleHeight + "px";
        chapterLineElement.style.height = chapterHeight + "px";

        if (index + 1 < progress) {
          thresholds = [
            ...thresholds,
            [totalHeight, totalHeight + chapterCircleHeight],
            [
              totalHeight + chapterCircleHeight,
              totalHeight + chapterCircleHeight + chapterHeight,
            ],
          ];

          totalHeight += chapterCircleHeight + chapterHeight;
        }
        if (index + 2 === progress) {
          thresholds = [
            ...thresholds,
            [totalHeight, totalHeight + chapterCircleHeight],
          ];

          totalHeight += chapterCircleHeight;
        }
      }
    });

    setTarget(totalHeight);
    setFloorIndex(thresholds);
  }, [milestones, progress, handleGetChapterElements]);

  useEffect(() => {
    if (floorIndex.length > 0) {
      setAdjusted(true);
    }
  }, [floorIndex]);

  useEffect(() => {
    if (adjusted && floorIndex.length > 0) handleAnimate(0, 0);
  }, [adjusted, floorIndex, handleAnimate]);

  useEffect(() => {
    handleSizeAdjustment();
  }, [handleSizeAdjustment]);

  return (
    <ul className="relative max-w-full">
      {milestones.map((chapter, index) => {
        const adjustedIndex = 2 * index;
        const stepIsWithinIndexRange =
          (floorIndex[adjustedIndex] &&
            !floorIndex[adjustedIndex + 1] &&
            adjusted &&
            index < progress &&
            step >= floorIndex[adjustedIndex][0]) ||
          (floorIndex[adjustedIndex] &&
            floorIndex[adjustedIndex + 1] &&
            adjusted &&
            index < progress &&
            step >= floorIndex[adjustedIndex][0] &&
            floorIndex[adjustedIndex + 1][1] > step);
        const stepIsWithinFirstHalfOfIndexRange =
          floorIndex[adjustedIndex] &&
          index < progress &&
          stepIsWithinIndexRange &&
          floorIndex[adjustedIndex][1] > step;
        const stepIsWithinSecondHalfOfIndexRange =
          floorIndex[adjustedIndex] &&
          index < progress &&
          stepIsWithinIndexRange &&
          step >= floorIndex[adjustedIndex][1];
        const stepExceedsRange =
          floorIndex[adjustedIndex + 1] &&
          adjusted &&
          index < progress &&
          step > floorIndex[adjustedIndex + 1][1];
        const stepExceedsHalfRange =
          floorIndex[adjustedIndex] &&
          adjusted &&
          index < progress &&
          step >= floorIndex[adjustedIndex][1];

        function GRADIENT_STYLE(value: number) {
          return `linear-gradient(
						180deg,
						${COMPLETE_COLOR} ${Math.max(value * 2 - 2, 0)}%,
						${INCOMPLETE_COLOR} ${Math.min(value * 2 - 2, 100)}%
					)`;
        }

        const circleStyle = (() => {
          if (stepIsWithinIndexRange) {
            if (stepIsWithinFirstHalfOfIndexRange) {
              const circleProgress =
                (step - floorIndex[adjustedIndex][0]) /
                (floorIndex[adjustedIndex][1] - floorIndex[adjustedIndex][0]);
              return GRADIENT_STYLE(circleProgress * 100);
            }
            return COMPLETE_COLOR;
          }
          if (stepExceedsRange) return COMPLETE_COLOR;
          return INCOMPLETE_COLOR;
        })();

        const lineStyle = (() => {
          if (index + 1 < milestones.length) {
            if (floorIndex[adjustedIndex + 1] && stepIsWithinIndexRange) {
              if (stepIsWithinSecondHalfOfIndexRange) {
                const lineProgress =
                  (step - floorIndex[adjustedIndex + 1][0]) /
                  (floorIndex[adjustedIndex + 1][1] -
                    floorIndex[adjustedIndex + 1][0]);
                return GRADIENT_STYLE(lineProgress * 100);
              }
              return INCOMPLETE_COLOR;
            }
            return stepExceedsRange ? COMPLETE_COLOR : INCOMPLETE_COLOR;
          }
          return INCOMPLETE_COLOR;
        })();

        return (
          <li
            key={`${title}-${chapter}`}
            className="relative flex w-full gap-4"
          >
            <div
              id={`Progress_${title}-${chapter}-circle`}
              className={clsx(
                "w-8 h-8",
                "flex items-center justify-center",
                "text-white rounded-full z-10"
              )}
              style={{
                left: CIRCLE_LEFT_OFFSET,
                marginTop: CIRCLE_TOP_OFFSET,
                background: circleStyle,
              }}
            >
              {stepExceedsHalfRange && <BsCheckLg />}
            </div>
            {index + 1 < milestones.length && (
              <div
                id={`Progress_${title}-${chapter}-line`}
                className={clsx("Course_nextProgress absolute w-1.5")}
                style={{
                  background: lineStyle,
                }}
              ></div>
            )}
            <CourseProgressVerticalMilestone
              indexText={indexTemplate && indexTemplate(index + 1)}
              title={chapter}
              id={`Progress_${title}-${chapter}`}
              caption={captions && captions[index]}
              styling={clsx(stylings && stylings[index])}
              link={links && links[index]}
            />
          </li>
        );
      })}
    </ul>
  );
}
