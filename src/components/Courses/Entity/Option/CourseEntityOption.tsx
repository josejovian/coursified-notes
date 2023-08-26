import { Icon } from "@/src/components/Basic/Icon";
import clsx from "clsx";
import {
  DetailedHTMLProps,
  HTMLAttributes,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { BsFillSquareFill } from "react-icons/bs";
import * as ReactDOM from "react-dom";
import { MdCheck } from "react-icons/md";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { AnswerType } from "@/src/type";

export interface OptionProps {
  content: string;
  selected?: boolean;
  solved?: number;
  id?: string;
  onSelect?: () => void;
}
export function Option({
  content,
  selected,
  solved = 0,
  id,
  onSelect,
}: OptionProps) {
  const contentRef = useRef<HTMLSpanElement>(null);

  const handleReplaceHashtag = useCallback((string: string) => {
    return string.replaceAll("#", "$");
  }, []);

  const renderWrapper = useCallback(
    (children?: string) => {
      if (!children) return <></>;

      return (
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >
          {handleReplaceHashtag(children)}
        </ReactMarkdown>
      );
    },
    [handleReplaceHashtag]
  );

  const handleRenderMarkdown = useCallback(() => {
    if (!contentRef.current || !content) return;

    ReactDOM.render(renderWrapper(content), contentRef.current);
  }, [content, renderWrapper]);

  useEffect(() => {
    handleRenderMarkdown();
  }, [handleRenderMarkdown]);

  return (
    <div
      role="option"
			aria-label="option"
      aria-selected={selected}
      className={clsx(
        "flex align-self-end items-center",
        "w-full 2xl:w-1/2 px-8 py-2 leading-7",
        "transition-colors rounded-sm shadow-sm border",
        selected
          ? solved
            ? "bg-success-1 border-success-3 shadow-green-100"
            : "bg-primary-1 border-primary-3 shadow-orange-100 hover:bg-primary-2 cursor-pointer"
          : [
              "bg-gray-50 border-secondary-3",
              !solved && "hover:bg-secondary-2 cursor-pointer",
            ]
      )}
      onClick={onSelect}
    >
      <div
        className={clsx(
          "w-6 h-6 min-w-6 mr-4 border flex items-center justify-center",
          solved && selected && "text-success-5 border-success-5 bg-success-5",
					!solved && selected && "text-primary-5 border-primary-5 bg-primary-5",
					!selected && "border-secondary-5"
        )}
      >
        <Icon className={clsx(!selected && "invisible", "text-secondary-1")} size="m" IconComponent={MdCheck} />
      </div>
      <span ref={contentRef} />
    </div>
  );
}
