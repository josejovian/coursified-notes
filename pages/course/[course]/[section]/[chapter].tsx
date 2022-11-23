import React, {
	useMemo,
	useState,
	useEffect,
	useCallback,
	useRef,
} from "react";
import clsx from "clsx";
import "katex/dist/katex.min.css";
import { useRouter } from "next/router";
import { AnswerType } from "@/src/type/Material";
import { ChapterAddressType, CourseType } from "@/src/type";
import {
	checkChapterProgress,
	getSpecificChapterAddress,
	storeChapterProgress,
} from "@/src/utils";
import { Button, Content, Side } from "@/src/components";

interface CourseMaterialProps {
	markdown: any;
	chapterAddress: ChapterAddressType;
	rawCourseDetail: any;
}

const CourseMaterial = ({
	markdown = "",
	chapterAddress,
	rawCourseDetail,
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
	const [errors, setErrors] = useState<any[]>([]);

	const courseDetail: CourseType = useMemo(
		() => JSON.parse(rawCourseDetail),
		[rawCourseDetail]
	);

	const chapterContent = useMemo(
		() => markdown.split("===")[page],
		[markdown, page]
	);

	const chapterBaseAddress = useMemo(
		() => ({
			...chapterAddress,
			page,
		}),
		[page, chapterAddress]
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
		setMaxPage(markdown.split("===").length);
	}, [markdown]);

	const handleCleanUpStates = useCallback(() => {
		setAccept({});
		setSolved(-1);
		setSubmmited(false);
		setAnswer({});
		setLoading(true);
	}, [setAccept, setAnswer, setLoading, setSolved, setSubmmited]);

	const handlePreviousPage = useCallback(() => {
		handleCleanUpStates();
		if (page > 0) setPage((prev) => prev - 1);
	}, [handleCleanUpStates, page, setPage]);

	const handleNextPage = useCallback(() => {
		handleCleanUpStates();
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
				router.replace(`/course/${chapterAddress.course}`);
			}, 250);
		}
	}, [
		chapterBaseAddress,
		handleCleanUpStates,
		maxPage,
		page,
		chapterAddress.course,
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
				page={page}
				handleCheckAnswer={handleCheckAnswer}
				onChapterChange={() => setPage(0)}
			/>
		),
		[
			addresses,
			chapterContent,
			stateAccept,
			stateAnswer,
			stateLoading,
			stateSolved,
			stateSubmitted,
			page,
			handleCheckAnswer,
			setPage,
		]
	);

	const renderCourseContents = useMemo(
		() => (
			<Side
				courseDetail={courseDetail}
				chapterAddress={chapterAddress}
				loading={loading}
			/>
		),
		[chapterAddress, courseDetail, loading]
	);

	return (
		<div id="CourseMaterial" className="flex w-full overflow-hidden">
			{renderCourseContents}
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
			markdown: chapterMD,
			chapterAddress: params,
			rawCourseDetail: JSON.stringify(courseDetail),
		},
	};
};

export default CourseMaterial;
