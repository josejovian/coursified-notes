import { ReactNode, useMemo, useRef, useState, useEffect } from "react";
import clsx from "clsx";
import { Button, Icon, Loader } from "../Basic";
import { useScreen } from "@/src/hooks";
import { MdChevronLeft } from "react-icons/md";
import Image, { ImageProps } from "next/image";

interface GenericProps {
  children: ReactNode;
  sideHeaderElement?: ReactNode;
  sideHeaderImage?: ImageProps;
  sideElement: ReactNode;
  bottomElement?: ReactNode;
  trueLoading?: boolean;
}

export function TemplateGeneric({
  children,
  bottomElement,
  sideHeaderElement,
  sideHeaderImage,
  sideElement,
  trueLoading,
}: GenericProps) {
  const headerWrapperRef = useRef<HTMLDivElement>(null);
  const textWrapperRef = useRef<HTMLDivElement>(null);

  const { width } = useScreen();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (headerWrapperRef.current && textWrapperRef.current) {
      headerWrapperRef.current.style.height = `${textWrapperRef.current.offsetHeight}px`;
    }
  });

  const renderSideToggleButton = useMemo(
    () => (
      <>
        <Button
          className={clsx(
            "fixed top-6",
            "cursor-pointer shadow-lg z-20 transition-transform",
            open ? "translate-x-64" : "translate-x-6",
            width >= 1024 && "hidden"
          )}
          onClick={() => setOpen((prev) => !prev)}
          color={open ? "tertiary" : "secondary"}
          icon
        >
          <Icon
            className={clsx(!open && "rotate-180")}
            size="l"
            IconComponent={MdChevronLeft}
          />
        </Button>
      </>
    ),
    [open, width]
  );

  const renderSideHeader = useMemo(
    () => (
      <>
        <div ref={headerWrapperRef} className="flex relative bg-black">
          {sideHeaderElement && (
            <div
              ref={textWrapperRef}
              className="absolute top-0 p-8 flex flex-col gap-4 z-10"
            >
              {sideHeaderElement}
            </div>
          )}
          {sideHeaderImage && (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image
              {...sideHeaderImage}
              width="512"
              height="512"
              alt="Banner"
              className="fixed top-0 left-0 object-none object-center opacity-20"
            />
          )}
        </div>
        <hr />
      </>
    ),
    [sideHeaderElement, sideHeaderImage]
  );

  return (
    <div
      id="CourseMaterial"
      className="flex relative w-full h-screen overflow-hidden"
    >
      <div
        className={clsx(
          "fixed top-0 left-0 self-center w-full h-full justify-self-center mx-auto",
          "flex justify-center items-center z-20 bg-white",
          !trueLoading && "hidden"
        )}
      >
        <Loader />
      </div>
      <>
        <aside
          id="CourseMaterial_side"
          className={clsx(
            "border-r border-zinc-400 flex flex-col flex-grow h-full bg-white z-10",
            width >= 1024
              ? "translate-x-0 !duration-0"
              : [
                  open
                    ? " absolute left-0 top-0 "
                    : "absolute left-0 top-0 -translate-x-full",
                ],
            width < 1024 && "transition-all"
          )}
        >
          {renderSideHeader}
          <div className="overflow-y-auto">{sideElement}</div>
        </aside>
        {renderSideToggleButton}
      </>
      <main className="relative flex flex-col flex-auto justify-between w-full overflow-hidden">
        {children}
        {bottomElement}
      </main>
    </div>
  );
}
