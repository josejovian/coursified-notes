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
	const stateSwapChapters = useState(false);
	const [loading, setLoading] = stateLoading;
	const [swapChapters, setSwapChapters] = stateSwapChapters;
	const stateAnswer = useState<Partial<AnswerType>>({});
	const [answer, setAnswer] = stateAnswer;
	const stateAccept = useState<AnswerType>({});
	const [accept, setAccept] = stateAccept;
	const stateSubmitted = useState(false);
	const stateChecking = useState(false);
	const setChecking = stateChecking[1];
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

	const trueLoading = useMemo(
		() => swapChapters || (!swapChapters && loading),
		[loading, swapChapters]
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
	const nextDestination = useMemo(() => {
		const { sections } = courseDetail;
		let nextAddress: ChapterAddressType = chapterAddress;
		let lastSection = false;

		sections.some((section, idx1) => {
			if (section.id === chapterAddress.section) {
				const { chapters } = section;
				chapters.some((chapter, idx2) => {
					if (chapter.id === chapterAddress.chapter) {
						if (idx2 + 1 === chapters.length) {
							if (idx1 + 1 === sections.length) {
								lastSection = true;
							} else {
								const nextSection = sections[idx1 + 1];
								nextAddress = {
									...nextAddress,
									section: nextSection.id ?? "",
									chapter: nextSection.chapters[0].id ?? "",
								};
							}
						} else {
							nextAddress = {
								...nextAddress,
								chapter: chapters[idx2 + 1].id ?? "",
							};
						}
						return true;
					}
					return false;
				});
				return true;
			}
			return false;
		});

		if (lastSection) {
			return `/course/${chapterAddress.course}`;
		}

		const { section, chapter } = nextAddress;

		return `/course/${chapterAddress.course}/${section}/${chapter}`;
	}, [chapterAddress, courseDetail]);

	const { read, practice } = addresses;

	const handleCheckAnswer = useCallback(
		(userAnswer: string, practiceId: string) => {
			setChecking(true);

			const result = (() => {
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
			})();

			setTimeout(() => {
				setChecking(false);
			}, 200);
			return result;
		},
		[accept, practice, setChecking]
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
				router.replace(nextDestination);
			}, 250);
		}
	}, [
		handleCleanUpStates,
		solved,
		read,
		page,
		maxPage,
		setPage,
		chapterBaseAddress,
		router,
		nextDestination,
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
				trueLoading={trueLoading}
				stateSolved={stateSolved}
				stateSubmitted={stateSubmitted}
				stateChecking={stateChecking}
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
			trueLoading,
			stateSolved,
			stateSubmitted,
			stateChecking,
			page,
			handleCheckAnswer,
			setPage,
		]
	);

	const handleRouteChangeStart = useCallback(() => {
		console.log("Start");
		setSwapChapters(true);
		handleCleanUpStates();
	}, [handleCleanUpStates, setSwapChapters]);

	const handleRouteChangeComplete = useCallback(() => {
		console.log("Complete");
		setSwapChapters(false);
		handleCleanUpStates();
	}, [handleCleanUpStates, setSwapChapters]);

	const renderCourseContents = useMemo(
		() => (
			<Side
				courseDetail={courseDetail}
				chapterAddress={chapterAddress}
				trueLoading={trueLoading}
			/>
		),
		[chapterAddress, courseDetail, trueLoading]
	);

	useEffect(() => {
		router.events.on("routeChangeStart", handleRouteChangeStart);
		router.events.on("routeChangeComplete", handleRouteChangeComplete);
		return () => {
			router.events.off("routeChangeStart", handleRouteChangeStart);
			router.events.off("routeChangeComplete", handleRouteChangeComplete);
		};
	}, [handleRouteChangeComplete, handleRouteChangeStart, router.events]);

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
