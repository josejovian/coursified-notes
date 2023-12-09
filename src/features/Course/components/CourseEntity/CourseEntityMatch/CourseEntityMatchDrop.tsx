import clsx from "clsx";

interface MatchDropProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  active: any;
  practiceId: string;
  handleClickDrop: () => void;
}

export function MatchDrop({
  active,
  practiceId,
  handleClickDrop,
}: MatchDropProps) {
  return (
    <div
      className={clsx(
        "Match_hole w-24 h-10 px-8 py-2 ml-8",
        "shadow-inner border-secondary-3 border",
        "rounded-sm transition-colors",
        active && active.id === practiceId
          ? "bg-primary-1 hover:bg-primary-2"
          : "bg-white hover:bg-secondary-1"
      )}
      onClick={handleClickDrop}
    ></div>
  );
}
