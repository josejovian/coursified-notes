import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { ChapterAddressType, ChapterType } from "@/src/type/Course";
import ReactMarkdown from "react-markdown";
import RemarkMath from "remark-math";
import RehypeKatex from "rehype-katex";
import Button from "@/src/compponents/basic/Button";
import Graph from "@/src/compponents/materials/Graph";
import evaluateMath from "@/src/utils/evaluateMath";
import * as ReactDOM from "react-dom";
import clsx from "clsx";
import { MathFunction, MathPoint } from "@/src/type/Math";
import remarkGfm from "remark-gfm";
import { ReactElement } from "react-markdown/lib/react-markdown";
import { CUSTOM_MATERIAL } from "@/src/type/Material";
import Input from "@/src/compponents/basic/Input";
import Blockquote from "@/src/compponents/basic/Quote";
import {
	checkChapterProgress,
	getCourseKey,
	getPracticeAnswer,
	getPracticeId,
	getSpecificChapterAddress,
	regexPracticeInput,
	storeChapterProgress,
} from "@/src/utils/course";
import { useRouter } from "next/router";

interface CourseMaterialProps {
	code: any;
	params: ChapterAddressType;
}

const CourseMaterial = ({ code = "", params }: CourseMaterialProps) => {
	const router = useRouter();
	const [page, setPage] = useState(0);
	const [solved, setSolved] = useState(-1);
	const [maxPage, setMaxPage] = useState(0);
	const [loading, setLoading] = useState(true);
	const [answer, setAnswer] = useState<{ [key: string]: string }>({});
	const [accept, setAccept] = useState<{ [key: string]: string }>({});
	const [submitted, setSubmmited] = useState(false);
	const answerInputBoxParentElement = useRef<
		{ parentElement: HTMLElement; string: string }[]
	>([]);

	const chapterAddress = useMemo(
		() => ({
			...params,
			page,
		}),
		[page, params]
	);

	const chapterReadAddress = useMemo(
		() => getSpecificChapterAddress(chapterAddress, "read"),
		[chapterAddress]
	);

	const chapterPracticeAddress = useMemo(
		() => getSpecificChapterAddress(chapterAddress, "practice"),
		[chapterAddress]
	);

	const handleCheckAnswer = useCallback(
		(userAnswer: string, practiceId: string) => {
			const exactAnswer: string = accept[practiceId];
			if (
				exactAnswer &&
				(exactAnswer === userAnswer ||
					String(exactAnswer) === String(userAnswer) ||
					exactAnswer.toLowerCase() === userAnswer.toLowerCase())
			) {
				const existingData =
					checkChapterProgress(chapterPracticeAddress) ?? {};
				storeChapterProgress(chapterPracticeAddress, {
					...existingData,
					[practiceId]: userAnswer,
				});
				return true;
			}

			return false;
		},
		[accept, chapterPracticeAddress]
	);

	const handleGetExistingAnswerIfAny = useCallback(() => {
		const existingAnswers = checkChapterProgress(chapterPracticeAddress);

		const practiceIds = Object.keys(accept);

		if (practiceIds.length === 0) return;

		let currentAnswers = {};
		let allAnswersAreCorrect = true;
		practiceIds.forEach((practiceId: string) => {
			if (
				existingAnswers &&
				existingAnswers[practiceId] &&
				handleCheckAnswer(existingAnswers[practiceId], practiceId)
			) {
				const specificAnswer = existingAnswers[practiceId];
				if (specificAnswer) {
					currentAnswers = {
						...currentAnswers,
						[practiceId]: specificAnswer,
					};
				}
			} else {
				allAnswersAreCorrect = false;
			}
		});

		if (
			allAnswersAreCorrect &&
			Object.keys(currentAnswers).length === practiceIds.length &&
			practiceIds.length > 0
		) {
			setAnswer(currentAnswers);
			setSubmmited(true);
			setSolved(1);
		}
	}, [chapterPracticeAddress, accept, handleCheckAnswer]);

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

	const userAnswerStatus = useCallback(
		(practiceId: string) => {
			if (answer[practiceId])
				return handleCheckAnswer(answer[practiceId], practiceId)
					? "success"
					: "error";
			return undefined;
		},
		[answer, handleCheckAnswer]
	);

	const renderAnswerBox = useCallback(
		(practiceId: string) => (
			<Input
				key={`InputBox-${practiceId}`}
				id={`InputBox-${practiceId}`}
				className="InputBox"
				onBlur={(e) => {
					if (answer !== accept) {
						setSubmmited(false);
						setAnswer((prev) => ({
							...prev,
							[practiceId]: e.target.value,
						}));
					}
				}}
				defaultValue={answer[practiceId]}
				disabled={
					solved === 1 || userAnswerStatus(practiceId) === "success"
				}
				state={submitted ? userAnswerStatus(practiceId) : undefined}
			/>
		),
		[answer, solved, userAnswerStatus, submitted, accept]
	);

	const handleRemoveCustomComponents = useCallback((className: string) => {
		const previousRenders = document.querySelectorAll(`.${className}`);
		previousRenders.forEach((element) => {
			//TODO: Something MIGHT be wrong with this unmount method.
			element.parentElement?.removeChild(element);
		});
	}, []);

	const handleRenderAnswerBoxes = useCallback(() => {
		answerInputBoxParentElement.current.forEach(
			({ parentElement, string }) => {
				const currentId = getPracticeId(string);
				if (currentId) {
					handleRemoveCustomComponents("InputBox");
					renderCustomElement(
						parentElement,
						renderAnswerBox(currentId),
						CUSTOM_MATERIAL["input"],
						string
					);
				}
			}
		);
	}, [handleRemoveCustomComponents, renderAnswerBox, renderCustomElement]);

	const handleConvertCodeToComponents = useCallback(() => {
		if (!loading) return;

		const container = document.getElementById("CourseMaterial_contents");

		Object.values(CUSTOM_MATERIAL).forEach((group) => {
			handleRemoveCustomComponents(group);
		});

		const elements = document.querySelectorAll(
			"#CourseMaterial_contents .CustomMaterialInvoker"
		);

		let inputElementsRendered = 0;

		let answerKeys = {};

		elements.forEach((element, index) => {
			const string = element.innerHTML;
			const parentElement = element.parentElement;

			let mathFuncs: MathFunction[] = [];
			let mathPoints: MathPoint[] = [];

			if (container && parentElement && string.startsWith("[graph]")) {
				const params = string.replace("[graph]", "").split("_");
				params.forEach((param) => {
					if (param.startsWith("function:")) {
						const funcs = param.replace("function:", "").split(",");
						mathFuncs = funcs.map((func: string) => {
							return (x: number) => {
								const value = evaluateMath(
									func.replace(/x/g, `(${x})`)
								);
								return value;
							};
						});
					} else if (param.startsWith("point:")) {
						const points = param.replace("point:", "").split("/");
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
				string.match(regexPracticeInput)
			) {
				const [currentId, currentAnswer] = [
					getPracticeId(string),
					getPracticeAnswer(string),
				];

				if (currentId && currentAnswer) {
					answerKeys = {
						...answerKeys,
						[currentId]: currentAnswer,
					};

					answerInputBoxParentElement.current = [
						...answerInputBoxParentElement.current,
						{
							parentElement,
							string,
						},
					];

					inputElementsRendered++;
				}
			}
		});

		if (inputElementsRendered > 0 && Object.values(answerKeys).length > 0) {
			setSolved(0);
			setAccept((prev) => ({
				...prev,
				...answerKeys,
			}));
			handleRenderAnswerBoxes();
		} else {
			setSolved(-1);
		}
	}, [
		loading,
		handleRemoveCustomComponents,
		renderCustomElement,
		handleRenderAnswerBoxes,
	]);

	useEffect(() => {
		handleRenderAnswerBoxes();
	}, [accept, answer, solved, userAnswerStatus, handleRenderAnswerBoxes]);

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

	const handlePrepareNewPage = useCallback(() => {
		if (loading) {
			handleConvertCodeToComponents();
			setLoading(false);
		}
	}, [handleConvertCodeToComponents, loading]);

	useEffect(() => {
		handlePrepareNewPage();
	}, [page, handlePrepareNewPage]);

	useEffect(() => {
		handleGetExistingAnswerIfAny();
	}, [accept, handleGetExistingAnswerIfAny, handleTransformBlockQuotes]);

	useEffect(() => {
		handleTransformBlockQuotes();
	}, [accept, answer, handleTransformBlockQuotes]);

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
												solved !== 1 && "hidden"
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
			solved,
		]
	);

	const handleCleanUpStates = useCallback(() => {
		setAccept({});
		setSolved(-1);
		setSubmmited(false);
		setAnswer({});
		setLoading(true);
	}, []);

	const handlePreviousPage = useCallback(() => {
		handleCleanUpStates();
		if (page > 0) setPage((prev) => prev - 1);
	}, [page, handleCleanUpStates]);

	const handleNextPage = useCallback(() => {
		handleCleanUpStates();
		if (solved !== 0) storeChapterProgress(chapterReadAddress, true);
		if (page < maxPage - 1) {
			setPage((prev) => prev + 1);
		} else {
			storeChapterProgress(
				{
					...chapterAddress,
					page: undefined,
				},
				true
			);
			router.replace(`/course/${params.course}`);
		}
	}, [
		chapterAddress,
		chapterReadAddress,
		maxPage,
		page,
		params,
		router,
		solved,
		handleCleanUpStates,
	]);

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
						// disabled={}
					>
						Next
					</Button>
				) : (
					<Button
						size="l"
						onClick={() => {
							setSubmmited(true);
							if (
								Object.values(answer).length ===
								Object.values(accept).length
							) {
								const correct = !Object.entries(answer).some(
									([key, answer]) => {
										return !handleCheckAnswer(answer, key);
									}
								);

								if (correct) setSolved(1);
							}
						}}
						disabled={
							Object.values(answer).length !==
								Object.values(accept).length ||
							Object.values(answer).filter((x) => x === "")
								.length > 1
						}
					>
						Check
					</Button>
				)}
			</div>
		),
		[
			handlePreviousPage,
			page,
			maxPage,
			solved,
			handleNextPage,
			answer,
			accept,
			handleCheckAnswer,
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
				sections
					.filter((x) => !x.includes(".json"))
					.map(async (section) => {
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
