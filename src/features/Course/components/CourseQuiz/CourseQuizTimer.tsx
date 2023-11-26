import { useEffect } from "react";
import { getHMS } from "@/utils/date";
import { StateType } from "@/type";

export function CourseQuizTimer({
  stateLeft,
  endAt,
  isStopped,
  onQuizNoTimeLeft,
}: {
  stateLeft: StateType<number>;
  endAt?: number;
  isStopped?: boolean;
  onQuizNoTimeLeft?: () => void;
}) {
  const [left, setLeft] = stateLeft;

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
    }, 100);
    return () => clearInterval(interval);
  }, [endAt, isStopped, onQuizNoTimeLeft, setLeft]);

  return <>{getHMS(left)}</>;
}
