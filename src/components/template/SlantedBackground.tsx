import { ReactNode } from "react";
import clsx from "clsx";

interface GenericProps {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
}

export function SlantedBackgroundTemplate({
  children,
  className,
  header,
}: GenericProps) {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="SlantedBackgroundTemplate h-full">
        <div
          className={clsx(
            "SlantedBackgroundTemplate_content",
            "py-32 px-96 text-white",
            className
          )}
        >
          {header}
        </div>
      </div>
      <div className="pt-24 pb-32 px-96 flex flex-col gap-8">{children}</div>
    </div>
  );
}
