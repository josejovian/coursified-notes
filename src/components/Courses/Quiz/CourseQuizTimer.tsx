import { useEffect, useState } from "react";
import clsx from "clsx";
import { getHMS } from "@/src/utils/date";

export function CourseQuizTimer({
  bottom = 0,
  endAt,
  onTimeOut,
}: {
  bottom: number;
  endAt: number;
  onTimeOut: () => void;
}) {
  const [left, setLeft] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      console.log(endAt - now);

      const timeLeft = endAt - now;

      if (timeLeft <= 0) onTimeOut();

      setLeft(Math.floor(endAt - now));
    }, 1000);
    return () => clearInterval(interval);
  }, [endAt, onTimeOut, setLeft]);

  return (
    <div
      className={clsx("w-full absolute")}
      style={{
        bottom,
      }}
    >
      <div
        className={clsx(
          "flex items-center justify-center py-4 px-8",
          "gap-4 w-fit",
          "border-t border-r border-zinc-400 bg-white"
        )}
      >
        <b>Time Left:</b> <span>{getHMS(left)}</span>
      </div>
    </div>
  );
}
