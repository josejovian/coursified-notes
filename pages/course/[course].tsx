import { Fragment, useMemo, useCallback } from "react";
import Section from "@/src/compponents/basic/Section";
import SlantedBackgroundTemplate from "@/src/compponents/template/SlantedBackground";
import CourseType, { SectionType } from "@/src/type/Course";
import { checkChapterProgress } from "@/src/utils/course";

const DUMMY_CHAPTERS: SectionType[] = [
	{
		title: "Limits",
		chapters: [
			{
				title: "Definition of Limit",
				requirements: [{ category: "read", completed: true }],
			},
			{
				title: "Laws of Limit",
				requirements: [
					{ category: "read", completed: true },
					{ category: "practice", completed: true },
				],
			},
			{
				title: "Limits of Trigonometric Functions",
				requirements: [{ category: "read" }],
			},
			{
				title: "Limits of Some Functions",
				requirements: [{ category: "read" }],
			},
			{
				title: "Continuity of a Function",
				requirements: [{ category: "read" }],
			},
			{ title: "Theorems", requirements: [{ category: "read" }] },
		],
	},
	{
		title: "Derivative",
		chapters: [
			{ title: "Definition of Derivative" },
			{ title: "Laws of Derivation" },
			{ title: "Derivation of Trigonometric Functions and Its Inverse" },
			{ title: "Limits of Some Functions" },
			{ title: "L'Hôpital's Rule" },
		],
	},
	{
		title: "Applications of Derivative",
		chapters: [
			{ title: "Global and Local Extrema of a Function" },
			{ title: "Increasing and Decreasing of a Function" },
		],
		progress: 2,
	},
	{
		title: "Function of Two or More Variables",
		chapters: [
			{ title: "Definition" },
			{ title: "Partial Derivative" },
			{ title: "Extrema" },
			{ title: "Gradient" },
		],
		progress: 2,
	},
];

const DUMMY: CourseType = {
	title: "Calculus I",
	description: `The notes I took for my Calculus course in the second semester.`,
	sections: DUMMY_CHAPTERS,
};

interface CourseProps {
	details: string;
}

const Course = ({ details }: CourseProps) => {
	const {
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
					const { requirements = [], pages } = chapter;

					requirements.forEach((requirement) => {
						if (requirement.category === "read")
							totalSteps += requirement.params.number ?? 0;
					});

					if (pages) {
					}

					const localAddress = {
						course: title,
						section: section.title,
						chapter: chapter.title,
					};

					return Math.floor((steps * 100) / totalSteps);
				});
			}
		);

		console.log(rawSectionChapterProgresses);

		return rawSectionChapterProgresses;
	}, [sections, title]);

	const completeSections = sections.map(
		(section: SectionType, index: number) => ({
			...section,
			chapters: section.chapters.map((chapter, index2: number) => ({
				...chapter,
				percentage: sectionProgresses[index][index2],
			})),
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
	console.log(details);

	return {
		props: { details: JSON.stringify(details) },
	};
};

export default Course;
