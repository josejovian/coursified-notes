import { Fragment, useMemo, useCallback } from "react";
import Section from "@/src/compponents/basic/Section";
import SlantedBackgroundTemplate from "@/src/compponents/template/SlantedBackground";
import CourseType, {
	RequirementMap,
	RequirementType,
	SectionType,
} from "@/src/type/Course";
import {
	checkChapterProgress,
	getSpecificChapterAddress,
} from "@/src/utils/course";
import { uncapitalize } from "@/src/utils/capitalize";

interface CourseProps {
	details: string;
}

const Course = ({ details }: CourseProps) => {
	const {
		id,
		title,
		description,
		sections = [] as SectionType[],
	} = useMemo(() => JSON.parse(details), [details]);

	const renderCourseHeader = useMemo(
		() => (
			<div className="flex flex-col gap-4">
				<h1 className="text-6xl">{title}</h1>
				<p className="text-2xl leading-10">{description}</p>
			</div>
		),
		[title, description]
	);

	const sectionProgresses = useMemo(() => {
		const rawSectionChapterProgresses = sections.map(
			(section: SectionType) => {
				let completedChapters = 0;

				return section.chapters.map((chapter) => {
					let totalSteps = 0;
					let steps = 0;
					const { requirements, pages } = chapter;

					if (pages) {
					}

					const localAddress = {
						course: id,
						section: section.id ?? uncapitalize(section.title),
						chapter: chapter.id ?? uncapitalize(chapter.title),
					};

					const localReadAddress = getSpecificChapterAddress(
						localAddress,
						"read"
					);

					const localPracticeAddress = getSpecificChapterAddress(
						localAddress,
						"practice"
					);

					let readProgress = 0;
					let practiceProgress = 0;

					if (typeof window !== "undefined") {
						const chapterProgress =
							checkChapterProgress(localReadAddress);
						const chapterPracticeProgress =
							checkChapterProgress(localPracticeAddress);

						if (chapterProgress)
							readProgress =
								Object.values(chapterProgress).length;

						if (chapterPracticeProgress)
							practiceProgress = Object.values(
								chapterPracticeProgress
							).length;
					}

					let requirementsProgresses: RequirementMap = {
						read: undefined,
						practice: undefined,
					};

					if (requirements) {
						requirementsProgresses = {
							read: requirements.read
								? {
										...requirements.read,
										params: {
											...requirements.read.params,
											progress: readProgress,
										},
								  }
								: undefined,
							practice: requirements.practice
								? {
										...requirements.practice,
										params: {
											...requirements.practice.params,
											progress: practiceProgress,
										},
								  }
								: undefined,
						};
					}

					return {
						percentage: Math.floor((steps * 100) / totalSteps),
						requirements: requirementsProgresses,
					};
				});
			}
		);

		return rawSectionChapterProgresses;
	}, [id, sections]);

	const completeSections = sections.map(
		(section: SectionType, index: number) => ({
			...section,
			chapters: section.chapters.map((chapter, index2: number) => {
				const { percentage, requirements } =
					sectionProgresses[index][index2];
				return {
					...chapter,
					requirements,
					percentage,
				};
			}),
		})
	);

	const renderCourseSections = useMemo(
		() => (
			<div className="grid grid-cols-1 gap-4">
				{completeSections.map((section: SectionType, index: number) => {
					return (
						<Fragment key={`${title}-${section.title}`}>
							<Section
								caption={`Section ${index + 1}`}
								section={section}
								index={index + 1}
							/>
						</Fragment>
					);
				})}
			</div>
		),
		[completeSections, title]
	);

	return (
		<SlantedBackgroundTemplate header={renderCourseHeader}>
			{renderCourseSections}
		</SlantedBackgroundTemplate>
	);
};

export const getStaticPaths = async () => {
	const { readAllCourses } = require("../../src/lib/mdx.tsx");
	const courses: string[] = await readAllCourses();

	return {
		paths: courses.map((course) => ({
			params: {
				course: course.replace(".mdx", ""),
			},
		})),
		fallback: false,
	};
};

export const getStaticProps = async (req: any) => {
	const { course } = req.params;
	const { readCourse, getDetailedCourse } = require("../../src/lib/mdx.tsx");

	const details = await getDetailedCourse(course);

	return {
		props: { details: JSON.stringify(details) },
	};
};

export default Course;
