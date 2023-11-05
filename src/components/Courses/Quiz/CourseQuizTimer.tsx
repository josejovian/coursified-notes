import { useEffect, useState } from "react";
import { getHMS } from "@/src/utils/date";

export function CourseQuizTimer({
  endAt,
  isStopped,
  onQuizNoTimeLeft,
}: {
  endAt?: number;
  isStopped?: boolean;
  onQuizNoTimeLeft?: () => void;
}) {
  const [left, setLeft] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();

      if (endAt) {
        let timeLeft = endAt;

        if (!isStopped) {
          timeLeft = timeLeft - now;
          timeLeft <= 0 && onQuizNoTimeLeft && onQuizNoTimeLeft();
          setLeft(Math.floor(timeLeft));
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [endAt, isStopped, onQuizNoTimeLeft, setLeft]);

  return <>{getHMS(left)}</>;
}
