/* eslint-disable react/jsx-no-undef */
import Image, { ImageProps } from "next/image";
import { useRef, useEffect, ReactNode } from "react";

export function CourseLayoutSideHeader({
  children,
  sideHeaderImage,
}: {
  children: ReactNode;
  sideHeaderImage: ImageProps;
}) {
  const headerWrapperRef = useRef<HTMLDivElement>(null);
  const textWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerWrapperRef.current && textWrapperRef.current) {
      headerWrapperRef.current.style.height = `${textWrapperRef.current.offsetHeight}px`;
    }
  });

  return (
    <>
      <div ref={headerWrapperRef} className="flex relative bg-black">
        <div
          ref={textWrapperRef}
          className="absolute top-0 p-8 flex flex-col gap-4 z-10"
        >
          {children}
        </div>
        <Image
          {...sideHeaderImage}
          width="512"
          height="512"
          alt="Banner"
          className="fixed top-0 left-0 object-none object-center opacity-20"
        />
      </div>
      <hr />
    </>
  );
}
