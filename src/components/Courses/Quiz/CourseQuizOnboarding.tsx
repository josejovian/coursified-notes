import { QuizConfigType } from "@/src/type";
import { IconText, Paragraph } from "../../Basic";
import { CourseLayoutContentTemplate } from "../Layout";
import { BsClock, BsQuestionCircle } from "react-icons/bs";

interface CourseQuizOnboardingProps {
  quizDetails: QuizConfigType;
  trueLoading: boolean;
}

export function CourseQuizOnboarding({
  quizDetails,
  trueLoading,
}: CourseQuizOnboardingProps) {
  const { title, questions, duration, description } = quizDetails;

  return (
    <CourseLayoutContentTemplate trueLoading={trueLoading}>
      <Paragraph as="h1" weight="bold">
        Quiz - {title}
      </Paragraph>
      <Paragraph as="p" size="l">
        {description}
      </Paragraph>
      <div className="flex gap-4">
        <IconText icon={BsQuestionCircle}>{questions} questions</IconText>
        <IconText icon={BsClock}>{duration} minutes</IconText>
      </div>
      <hr />
      <Paragraph as="h2" weight="bold">
        Guidelines
      </Paragraph>
      <ul>
        <li>
          Once you click the Start button, the timer will start, and you can
          start working on the quiz.
        </li>
        <li>
          Once you are finished, you can submit your answers and finish the quiz
          early.
        </li>
        <li>The quiz result is shown immediately after answer submission.</li>
        <li>Quizzes that have been answered cannot be reworked.</li>
        <li>Each question can only yield full points or none.</li>
      </ul>
    </CourseLayoutContentTemplate>
  );
}
