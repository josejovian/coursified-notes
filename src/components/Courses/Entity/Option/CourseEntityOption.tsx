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
      id={id}
      role="option"
      aria-selected={selected}
      className={clsx(
        "flex",
        "w-full 2xl:w-1/2 px-8 py-2",
        "transition-all rounded-sm",
        selected
          ? solved
            ? "bg-success-1 border border-success-5"
            : "bg-primary-1 border border-primary-5 hover:bg-primary-2 cursor-pointer"
          : [
              "bg-secondary-1 border border-secondary-5",
              !solved && "hover:bg-secondary-2 cursor-pointer",
            ]
      )}
      onClick={onSelect}
    >
      <div
        className={clsx(
          "w-4 h-4 min-w-4 mr-4 flex items-center justify-center",
          solved && selected ? "text-success-5" : "text-primary-5"
        )}
      >
        <Icon className={clsx(!selected && "invisible")} size="s" IconComponent={MdCheck} />
      </div>
      <span ref={contentRef} />
    </div>
  );
}
