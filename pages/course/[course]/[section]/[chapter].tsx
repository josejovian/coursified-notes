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
import CourseType, {
	ChapterAddressType,
	ChapterType,
	SectionType,
} from "@/src/type/Course";
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
import { checkChapterProgress, storeChapterProgress } from "@/src/utils/course";

const DUMMY: ChapterType = {
	title: "Definition of Limit",
	requirements: [{ category: "read", completed: true }],
};

interface CourseMaterialProps {
	code: any;
	params: ChapterAddressType;
}

const CourseMaterial = ({ code = "", params }: CourseMaterialProps) => {
	const { title, requirements } = DUMMY;
	const [page, setPage] = useState(0);
	const [solved, setSolved] = useState(-1);
	const [maxPage, setMaxPage] = useState(0);
	const [loading, setLoading] = useState(true);
	const [answer, setAnswer] = useState<string | number>("");
	const [accept, setAccept] = useState<string | number>("");
	const [submitted, setSubmmited] = useState(false);

	const chapterAddress = useMemo(
		() => ({
			...params,
			page,
		}),
		[page, params]
	);

	const handleCheckAnswer = useCallback(
		(input: string | number) => {
			if (
				accept === input ||
				(typeof accept === "string" &&
					typeof input === "string" &&
					accept.toLowerCase() === input.toLowerCase())
			) {
				storeChapterProgress(chapterAddress, input);
				return true;
			}

			return false;
		},
		[accept, chapterAddress]
	);

	const handleGetExistingAnswerIfAny = useCallback(() => {
		const existingAnswer = checkChapterProgress(chapterAddress);
		
		if (existingAnswer && handleCheckAnswer(existingAnswer)) {
			setAnswer(accept);
			setSubmmited(true);
			setSolved(1);
		}
	}, [chapterAddress, handleCheckAnswer, accept]);

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
		if (submitted) return handleCheckAnswer(answer) ? "success" : "error";
		return undefined;
	}, [submitted, answer, handleCheckAnswer]);

	const renderAnswerBox = useMemo(
		() => (
			<Input
				id="InputBox"
				onBlur={(e) => {
					if (answer !== accept) {
						setSubmmited(false);
						setAnswer(e.target.value);
					}
				}}
				defaultValue={answer}
				disabled={solved === 1}
				state={userAnswerStatus}
			/>
		),
		[accept, answer, userAnswerStatus, solved]
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
			// if (completedPages.includes(page)) {
			// 	setSolved(1);
			// }
			if (inputElementsRendered > 0) {
				setSolved(0);
			} else {
				setSolved(-1);
			}
		},
		[loading, renderAnswerBox, renderCustomElement]
	);

	const handleTransformBlockQuotes = useCallback(() => {
		const blockquotes = document.querySelectorAll("blockquote");

		blockquotes.forEach((bq) => {
			bq.innerHTML = bq.innerHTML.replace(/\#[^\#]*\#/g, "");
		});
	}, []);

	const handleCheckForCodeInvokedElements = useCallback((element: any) => {
		return element.toString().match(/\[[^\]]*\]/g);
	}, []);

	const handleCheckForSpecialBlockquote = useCallback(
		(element: any, type: "formula" | "explanation") => {
			const regex =
				type === "formula" ? /\#formula\#/ : /\#explanation\#/;

			return element.some((str: any) => {
				if (typeof str === "object") {
					return str.props.children.some((x: any) =>
						typeof x === "string" ? x.match(regex) : false
					);
				}
				return str.match(regex);
			});
		},
		[]
	);

	useEffect(() => {
		handleConvertCodeToComponents(true);
		handleTransformBlockQuotes();
		handleGetExistingAnswerIfAny();
	}, [
		page,
		handleConvertCodeToComponents,
		handleTransformBlockQuotes,
		handleGetExistingAnswerIfAny,
	]);

	const renderChapterContents = useMemo(
		() => (
			<div className="flex w-full h-full overflow-x-hidden overflow-y-scroll">
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
								if (
									handleCheckForSpecialBlockquote(
										children,
										"explanation"
									)
								)
									return (
										<Blockquote
											className={clsx(
												userAnswerStatus !==
													"success" && "hidden"
											)}
											color="success"
										>
											{children}
										</Blockquote>
									);

								if (
									handleCheckForSpecialBlockquote(
										children,
										"formula"
									)
								)
									return (
										<Blockquote className="!pl-8">
											{children}
										</Blockquote>
									);

								return <Blockquote>{children}</Blockquote>;
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
			handleCheckForSpecialBlockquote,
			userAnswerStatus,
		]
	);

	const handleCleanUpStates = useCallback(() => {
		setAccept("");
		setSolved(-1);
		setSubmmited(false);
		setAnswer("");
	}, []);

	const handlePreviousPage = useCallback(() => {
		handleCleanUpStates();
		if (page > 0) setPage((prev) => prev - 1);
	}, [handleCleanUpStates, page]);

	const handleNextPage = useCallback(() => {
		handleCleanUpStates();
		if (page < maxPage - 1) setPage((prev) => prev + 1);
	}, [handleCleanUpStates, page, maxPage]);

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
							handleCheckAnswer(answer);
						}}
						disabled={answer === ""}
					>
						Check
					</Button>
				)}
			</div>
		),
		[
			answer,
			page,
			maxPage,
			solved,
			handleNextPage,
			handleCheckAnswer,
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

	const params = { course, section, chapter };
	const projectMD = await readChapter(course, section, chapter);

	return {
		props: { code: projectMD, params: params },
	};
};

export default CourseMaterial;
