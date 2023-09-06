import { MdOutlineDescription } from "react-icons/md";
import { Icon } from "../../Basic/Icon";
import clsx from "clsx";
import { Paragraph } from "../../Basic";
import Link from "next/link";

interface CourseQuizListQuestionProps {
  title: string;
  caption?: string;
  index: number;
  status: "unanswered" | "answered" | "correct" | "incorrect";
  onClick?: () => void;
  className?: string;
  active?: boolean;
}

export function CourseQuizListQuestion({
  title,
  caption,
  index,
  status,
  onClick,
  className,
  active,
}: CourseQuizListQuestionProps) {
  return (
    <Link href={`#q${index + 1}`}>
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
        key={title}
        onClick={onClick}
      >
        <Icon
          IconComponent={MdOutlineDescription}
          className="mr-4 text-inherit"
          size="m"
        />

        <span className="w-full flex justify-between gap-4 items-start h-min">
          <Paragraph as="p" className="truncate" color="inherit">
            {title}
          </Paragraph>
          <Paragraph className=" w-max whitespace-nowrap">{caption}</Paragraph>
        </span>
      </div>
    </Link>
  );
}
