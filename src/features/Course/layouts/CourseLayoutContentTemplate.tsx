import { ReactNode } from "react";
import clsx from "clsx";
import { Loader } from "../../../components/Basic";

interface CourseLayoutContentTemplateProps {
  children: ReactNode;
  trueLoading?: boolean;
}

export function CourseLayoutContentTemplate({
  trueLoading,
  children,
}: CourseLayoutContentTemplateProps) {
  return (
    <div className="relative flex w-full h-full overflow-x-hidden overflow-y-scroll">
      <div
        className={clsx(
          "self-center w-full h-full justify-self-center mx-auto",
          "flex justify-center items-center z-10",
          !trueLoading && "hidden"
        )}
      >
        <Loader />
      </div>
      <article
        className={clsx(
          "CourseMaterial_wrapper",
          "absolute left-0 top-0",
          "w-full h-full pt-24 p-adapt-sm",
          trueLoading && "hidden"
        )}
      >
        <div className="CourseMaterial_content">{children}</div>
      </article>
    </div>
  );
}
