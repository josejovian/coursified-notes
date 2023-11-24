import { ReactNode, useMemo, useRef, useState, useEffect } from "react";
import clsx from "clsx";
import { Button, Icon, Loader } from "../Basic";
import { useScreen } from "@/hooks";
import { MdChevronLeft } from "react-icons/md";
import Image, { ImageProps } from "next/image";

interface GenericProps {
  children: ReactNode;
  sideHeaderImage?: ImageProps;
  sideElement?: ReactNode;
  bottomElement?: ReactNode;
  trueLoading?: boolean;
}

export function TemplateGeneric({
  children,
  bottomElement,
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
          {sideElement}
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
