import type { NextPage } from "next";
import {
	Fragment,
	useMemo,
	useState,
	useEffect,
	useCallback,
	useRef,
	ReactNode,
	createElement,
} from "react";
import Section from "@/src/compponents/basic/Section";
import SlantedBackgroundTemplate from "@/src/compponents/template/SlantedBackground";
import CourseType, { ChapterType, SectionType } from "@/src/type/Course";
import ReactMarkdown from "react-markdown";
import RemarkMath from "remark-math";
import RehypeKatex from "rehype-katex";
import Button from "@/src/compponents/basic/Button";
import Graph from "@/src/compponents/materials/Graph";
import evaluateMath from "@/src/utils/evaluateMath";
import * as ReactDOM from "react-dom";
import clsx from "clsx";
import { BsChevronDoubleLeft, BsChevronDoubleRight } from "react-icons/bs";
import { MathFunction, MathPoint } from "@/src/type/Math";
import remarkGfm from "remark-gfm";
import { ReactElement } from "react-markdown/lib/react-markdown";
import { CUSTOM_MATERIAL } from "@/src/type/Material";
import Input from "@/src/compponents/basic/Input";
import Blockquote from "@/src/compponents/basic/Quote";

const DUMMY: ChapterType = {
	title: "Definition of Limit",
	requirements: [{ category: "read", completed: true }],
};

interface CourseMaterialProps {
	code: any;
}

const CourseMaterial = ({ code = "" }: CourseMaterialProps) => {
	const { title, requirements } = DUMMY;
	const [page, setPage] = useState(0);
	const [solved, setSolved] = useState(-1);
	const [completedPages, setCompletedPages] = useState<number[]>([]);
	const [maxPage, setMaxPage] = useState(0);
	const [loading, setLoading] = useState(true);
	const [answer, setAnswer] = useState<string | number>("");
	const [accept, setAccept] = useState<string | number>("");
	const [submitted, setSubmmited] = useState(false);

	useEffect(() => {
		setMaxPage(code.split("===").length);
	}, [code]);

	const renderCustomElement = useCallback(
		(
			parentElement: HTMLElement,
			targetElement: ReactElement,
			group: string,
			id: string
		) => {
			const vessel = document.createElement("div");
			vessel.id = `${group}-${id}`;
			vessel.classList.add(group);

			parentElement.parentElement?.insertBefore(
				vessel,
				parentElement.nextSibling
			);

			ReactDOM.render(targetElement, vessel);
		},
		[]
	);

	const userAnswerStatus = useMemo(() => {
		if (submitted) return answer === accept ? "success" : "error";
		return undefined;
	}, [answer, accept, submitted]);

	const renderAnswerBox = useMemo(
		() => (
			<Input
				id="InputBox"
				onBlur={(e) => {
					setSubmmited(false);
					setAnswer(e.target.value);
				}}
				defaultValue={answer}
				state={userAnswerStatus}
			/>
		),
		[answer, userAnswerStatus]
	);

	const handleConvertCodeToComponents = useCallback(
		(bypass: boolean = false) => {
			if (!loading && !bypass) return;

			const container = document.getElementById(
				"CourseMaterial_contents"
			);

			Object.values(CUSTOM_MATERIAL).forEach((group) => {
				const previousRenders = document.querySelectorAll(`.${group}`);
				previousRenders.forEach((element) => {
					// ReactDOM.unmountComponentAtNode(element);
					element.parentElement?.removeChild(element);
				});
			});

			const elements = document.querySelectorAll(
				"#CourseMaterial_contents .CustomMaterialInvoker"
			);

			let inputElementsRendered = 0;

			elements.forEach((element) => {
				const string = element.innerHTML;
				const parentElement = element.parentElement;

				let mathFuncs: MathFunction[] = [];
				let mathPoints: MathPoint[] = [];

				if (
					container &&
					parentElement &&
					string.startsWith("[graph]")
				) {
					const params = string.replace("[graph]", "").split("_");
					params.forEach((param) => {
						if (param.startsWith("function:")) {
							const funcs = param
								.replace("function:", "")
								.split(",");
							mathFuncs = funcs.map((func: string) => {
								return (x: number) => {
									const value = evaluateMath(
										func.replace(/x/g, `(${x})`)
									);
									return value;
								};
							});
						} else if (param.startsWith("point:")) {
							const points = param
								.replace("point:", "")
								.split("/");
							points.forEach((point) => {
								const parse = point.split("-");
								if (parse.length === 2) {
									const variant = parse[1];
									const coords = parse[0]
										.split(",")
										.map((x) => Number(x));
									const [y, x] = coords;
									if (coords.length === 2) {
										mathPoints.push({
											points: [y, x],
											variant: variant ?? "solid",
										});
									}
								}
							});
						}
					});

					if (mathFuncs.length > 0 || mathPoints.length > 0) {
						renderCustomElement(
							parentElement,
							<Graph
								id={string}
								mathFunctions={mathFuncs}
								mathPoints={mathPoints}
							/>,
							CUSTOM_MATERIAL["graph"],
							string
						);
					}
				}
				if (
					container &&
					parentElement &&
					string.startsWith("[input]")
				) {
					setAccept(string.replace("[input]", ""));
					renderCustomElement(
						parentElement,
						renderAnswerBox,
						CUSTOM_MATERIAL["input"],
						string
					);
					inputElementsRendered++;
				}
			});

			setLoading(false);
			if (completedPages.includes(page)) {
				setSolved(1);
			}
			if (inputElementsRendered > 0) {
				setSolved(0);
			} else {
				setSolved(-1);
			}
		},
		[completedPages, loading, page, renderAnswerBox, renderCustomElement]
	);

	const handleTransformBlockQuotes = useCallback(() => {
		const blockquotes = document.querySelectorAll(
			".ConditionalBlockQuotes"
		);

		blockquotes.forEach((bq) => {
			bq.innerHTML = bq.innerHTML.replace("#submitted#", "");
		});
	}, []);

	const handleCheckForCodeInvokedElements = useCallback((element: any) => {
		return element.toString().match(/\[[^\]]*\]/g);
	}, []);

	const handleCheckForConditionalBlockquotes = useCallback((element: any) => {
		return element.some((str: any) => {
			if (typeof str === "object") {
				return str.props.children.some((x: string) =>
					x.match(/\#submitted\#/)
				);
			}
			return str.match(/\#submitted\#/);
		});
	}, []);

	useEffect(() => {
		handleConvertCodeToComponents(true);
		handleTransformBlockQuotes();
	}, [page, handleConvertCodeToComponents, handleTransformBlockQuotes]);

	const renderChapterContents = useMemo(
		() => (
			<div className="flex w-full h-full overflow-y-scroll">
				<article
					id="CourseMaterial_contents"
					className="h-full pt-32 p-adapt-sm"
				>
					<ReactMarkdown
						className="CourseMaterial_contents pb-32"
						components={{
							code: ({ node, children, ...props }) => {
								return handleCheckForCodeInvokedElements(
									children
								) ? (
									<span className="CustomMaterialInvoker hidden">
										{children}
									</span>
								) : (
									<code>{children}</code>
								);
							},
							blockquote: ({ node, children, ...props }) => {
								const conditionExists =
									handleCheckForConditionalBlockquotes(
										children
									);

								return conditionExists ? (
									<Blockquote
										className={clsx(
											"ConditionalBlockQuotes",
											!submitted && "hidden"
										)}
										color="success"
									>
										{children}
									</Blockquote>
								) : (
									<Blockquote>{children}</Blockquote>
								);
							},
						}}
						remarkPlugins={[RemarkMath, remarkGfm]}
						rehypePlugins={[RehypeKatex]}
					>
						{code.split("===")[page]}
					</ReactMarkdown>
				</article>
			</div>
		),
		[
			code,
			page,
			handleCheckForCodeInvokedElements,
			handleCheckForConditionalBlockquotes,
			submitted,
		]
	);

	const handlePreviousPage = useCallback(() => {
		if (page > 0) setPage((prev) => prev - 1);
	}, [page]);

	const handleNextPage = useCallback(() => {
		if (page < maxPage - 1) setPage((prev) => prev + 1);
	}, [page, maxPage]);

	const renderPageControls = useMemo(
		() => (
			<div
				className={clsx(
					"flex justify-center items-center p-8",
					"gap-8 w-full bg-gray-100"
				)}
			>
				<Button
					color="secondary"
					size="l"
					onClick={handlePreviousPage}
					disabled={page <= 0}
				>
					Back
				</Button>
				<span className="w-16 text-2xl text-center">
					{page + 1} / {maxPage}
				</span>
				{solved !== 0 ? (
					<Button
						size="l"
						onClick={handleNextPage}
						disabled={page >= maxPage - 1}
					>
						Next
					</Button>
				) : (
					<Button
						size="l"
						onClick={() => {
							setSubmmited(true);
							if (accept === answer) alert("CORRECT!");
						}}
						disabled={answer === ""}
					>
						Check
					</Button>
				)}
			</div>
		),
		[
			accept,
			answer,
			maxPage,
			page,
			solved,
			handleNextPage,
			handlePreviousPage,
		]
	);

	return (
		<div className="CourseMaterial flex w-full overflow-hidden">
			<link
				rel="stylesheet"
				href="https://cdn.jsdelivr.net/npm/katex@0.15.0/dist/katex.min.css"
			/>
			<aside className="p-8"></aside>
			<main
				className="relative flex flex-col justify-between w-full h-screen overflow-hidden"
				style={{ flex: "1 1 auto" }}
			>
				{renderChapterContents}
				{renderPageControls}
			</main>
		</div>
	);
};

export const getStaticPaths = async () => {
	const {
		readAllChapters,
		readAllSections,
		readAllCourses,
	} = require("../../../../src/lib/mdx.tsx");
	const courses: string[] = await readAllCourses();

	const strings = await Promise.all(
		courses.map(async (course) => {
			const sections: string[] = await readAllSections(course);
			return await Promise.all(
				sections.map(async (section) => {
					const chapters: string[] = await readAllChapters(
						course,
						section
					);
					return await Promise.all(
						chapters.map((chapter) => ({
							params: {
								course: course,
								section: section,
								chapter: chapter.replace(".mdx", ""),
							},
						}))
					);
				})
			);
		})
	);

	return {
		paths: strings.flat(4),
		fallback: false,
	};
};

export const getStaticProps = async (req: any) => {
	const { course, section, chapter } = req.params;
	const { readChapter } = require("../../../../src/lib/mdx.tsx");

	const projectMD = await readChapter(course, section, chapter);

	return {
		props: { code: projectMD },
	};
};

export default CourseMaterial;
