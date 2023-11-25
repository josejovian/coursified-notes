import React, { useCallback, useEffect, useState } from "react";
import { BsClock, BsQuestionCircle } from "react-icons/bs";
import { getPercent, getPercentGroup, getQuizAnswerSheet } from "@/utils";
import { ChapterAddressType, QuizConfigType } from "@/type";
import { Badge, IconText, Paragraph } from "../../Basic";
import { CourseLayoutContentTemplate } from "../Layout";

interface CourseQuizOnboardingProps {
  chapterAddress: ChapterAddressType;
  quizDetails: QuizConfigType;
  trueLoading: boolean;
}

export function CourseQuizOnboarding({
  chapterAddress,
  quizDetails,
  trueLoading,
}: CourseQuizOnboardingProps) {
  const [percent, setPercent] = useState<number>();
  const { title, duration, questions, description } = quizDetails;

  const handleGetPercent = useCallback(() => {
    const answerSheet = getQuizAnswerSheet(chapterAddress);
    if (!answerSheet) return;

    const calculated = getPercent(answerSheet);
    setPercent(calculated);
  }, [chapterAddress]);

  useEffect(() => {
    handleGetPercent();
  }, [handleGetPercent]);

  return (
    <CourseLayoutContentTemplate trueLoading={trueLoading}>
      <div className="flex flex-row items-center gap-8">
        <Paragraph as="h1" weight="bold">
          Quiz - {title}
        </Paragraph>
        {!!percent && (
          <Badge color={getPercentGroup(percent)} size="l">
            {percent}%
          </Badge>
        )}
      </div>
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
