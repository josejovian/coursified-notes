import { useMemo } from "react";
import clsx from "clsx";
import { MdOutlineDescription } from "react-icons/md";
import { Paragraph, Icon } from "../../Basic";
import { QuizAnswerType, QuizPhaseType, QuizQuestionType } from "@/src/type";

interface CourseQuizListQuestionProps {
  phase: QuizPhaseType;
  question: QuizQuestionType;
  answer?: QuizAnswerType;
  index: number;
  className?: string;
  active?: boolean;
  onClick?: (id: number) => void;
}

export function CourseQuizListQuestion({
  question,
  answer,
  phase,
  index,
  onClick,
  className,
  active,
}: CourseQuizListQuestionProps) {
  const { weight } = question;

  const status = useMemo(() => {
    if (!answer || !answer) return "unanswered";

    if (phase === "submitted") return answer.correct ? "correct" : "incorrect";

    return answer.answered ? "answered" : "unanswered";
  }, [answer, phase]);

  return (
    <div
      className={clsx(
        "flex items-center cursor-pointer",
        status === "correct" && [
          "hover:bg-success-2 hover:bg-success-2",
          active && "bg-success-1",
        ],
        status === "incorrect" && [
          "hover:bg-danger-2 hover:bg-danger-2",
          active && "bg-danger-1",
        ],
        status === "unanswered" && [
          "hover:bg-secondary-2 hover:bg-secondary-2",
          active && "bg-secondary-1",
        ],
        status === "answered" && [
          "hover:bg-orange-100",
          active && "bg-orange-50",
        ],
        status === "correct" && "text-success-6",
        status === "incorrect" && "text-danger-6",
        status === "unanswered" && "text-secondary-5",
        status === "answered" && "text-orange-600",
        className
      )}
      onClick={() => onClick && onClick(index)}
    >
      <Icon
        IconComponent={MdOutlineDescription}
        className="mr-4 text-inherit"
        size="m"
      />

      <span className="w-full flex justify-between gap-4 items-start h-min">
        <Paragraph as="p" className="truncate" color="inherit">
          Q{index}
        </Paragraph>
        <Paragraph className=" w-max whitespace-nowrap">{weight} pts</Paragraph>
      </span>
    </div>
  );
}
