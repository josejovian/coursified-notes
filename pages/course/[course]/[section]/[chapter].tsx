import {
	useMemo,
	useState,
	useEffect,
	useCallback,
	useRef,
	ReactNode,
	DetailedHTMLProps,
	HTMLAttributes,
} from "react";
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
import { AnswerType, CUSTOM_MATERIAL } from "@/src/type/Material";
import Input from "@/src/compponents/basic/Input";
import Blockquote from "@/src/compponents/basic/Quote";
import TeX from "@matejmazur/react-katex";
import "katex/dist/katex.min.css";

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
import Content from "@/src/compponents/materials/Content";

interface CourseMaterialProps {
	code: any;
	courseDetail: any;
	params: ChapterAddressType;
}

const CourseMaterial = ({
	code = "",
	courseDetail,
	params,
}: CourseMaterialProps) => {
	const router = useRouter();
	const statePage = useState(0);
	const [page, setPage] = statePage;
	const stateSolved = useState(-1);
	const [solved, setSolved] = stateSolved;
	const [maxPage, setMaxPage] = useState(0);
	const stateLoading = useState(true);
	const [loading, setLoading] = stateLoading;
	const stateAnswer = useState<Partial<AnswerType>>({});
	const [answer, setAnswer] = stateAnswer;
	const stateAccept = useState<AnswerType>({});
	const [accept, setAccept] = stateAccept;
	const stateSubmitted = useState(false);
	const [submitted, setSubmmited] = stateSubmitted;
	const answerInputBoxParentElement = useRef<
		{ parentElement: HTMLElement; string: string }[]
	>([]);
	const matchParentElement = useRef<
		{ parentElement: HTMLElement; pair: [string, string]; id: string }[]
	>([]);
	const leftCards = useRef<any[]>([]);
	const rightCards = useRef<any[]>([]);
	const [errors, setErrors] = useState<any[]>([]);
	const [active, setActive] = useState<any>(null);

	const chapterContent = useMemo(() => code.split("===")[page], [code, page]);

	useEffect(() => {
		console.log("Answer Box");
		console.log(answer);
	}, [answer]);

	const chapterBaseAddress = useMemo(
		() => ({
			...params,
			page,
		}),
		[page, params]
	);

	const addresses = useMemo(
		() => ({
			read: getSpecificChapterAddress(chapterBaseAddress, "read"),
			practice: getSpecificChapterAddress(chapterBaseAddress, "practice"),
		}),
		[chapterBaseAddress]
	);

	const { read, practice } = addresses;

	const handleCheckAnswer = useCallback(
		(userAnswer: string, practiceId: string) => {
			const exactAnswer: string = accept[practiceId];
			if (
				exactAnswer &&
				(exactAnswer === userAnswer ||
					String(exactAnswer) === String(userAnswer) ||
					exactAnswer.toLowerCase() === userAnswer.toLowerCase())
			) {
				const existingData = checkChapterProgress(practice) ?? {};
				storeChapterProgress(practice, {
					...existingData,
					[practiceId]: userAnswer,
				});
				return true;
			}

			return false;
		},
		[accept, practice]
	);

	useEffect(() => {
		setMaxPage(code.split("===").length);
	}, [code]);

	const renderChapterContents = useMemo(
		() => (
			<Content
				addreses={addresses}
				markdown={chapterContent}
				stateAccept={stateAccept}
				stateAnswer={stateAnswer}
				stateLoading={stateLoading}
				stateSolved={stateSolved}
				stateSubmitted={stateSubmitted}
				statePage={statePage}
				handleCheckAnswer={handleCheckAnswer}
			/>
		),
		[
			addresses,
			chapterContent,
			handleCheckAnswer,
			stateAccept,
			stateAnswer,
			stateLoading,
			statePage,
			stateSolved,
			stateSubmitted,
		]
	);

	const handlePreviousPage = useCallback(() => {
		if (page > 0) setPage((prev) => prev - 1);
	}, [page, setPage]);

	const handleNextPage = useCallback(() => {
		if (solved !== 0) storeChapterProgress(read, true);
		if (page < maxPage - 1) {
			setPage((prev) => prev + 1);
		} else {
			storeChapterProgress(
				{
					...chapterBaseAddress,
					page: undefined,
				},
				true
			);
			setTimeout(() => {
				router.replace(`/course/${params.course}`);
			}, 250);
		}
	}, [
		chapterBaseAddress,
		maxPage,
		page,
		params.course,
		read,
		router,
		setPage,
		solved,
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
					<Button size="l" onClick={handleNextPage}>
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
										return !handleCheckAnswer(
											answer ?? "",
											key
										);
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
			setSubmmited,
			setSolved,
			handleCheckAnswer,
		]
	);

	return (
		<div className="CourseMaterial flex w-full overflow-hidden">
			<aside className="shadow-lg">
				<div className="p-8">
					<h2>Limits</h2>
				</div>
				<hr />
			</aside>
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
	const {
		getDetailedCourse,
		readChapter,
	} = require("../../../../src/lib/mdx.tsx");

	const params = { course, section, chapter };

	const chapterMD = await readChapter(course, section, chapter);

	const courseDetail = await getDetailedCourse(course);

	return {
		props: {
			code: chapterMD,
			params: params,
			courseDetail: JSON.stringify(courseDetail),
		},
	};
};

export default CourseMaterial;
