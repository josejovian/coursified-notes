import type { NextPage } from "next";
import { Fragment, useMemo } from "react";
import Section from "@/src/compponents/basic/Section";
import SlantedBackgroundTemplate from "@/src/compponents/template/SlantedBackground";
import CourseType, { SectionType } from "@/src/type/Course";
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

const Course: NextPage = () => {
	const { title, description, sections } = DUMMY;

	const renderCourseHeader = useMemo(
		() => (
			<div className="flex flex-col gap-4">
				<h1 className="text-6xl">{title}</h1>
				<p className="text-2xl leading-10">{description}</p>
			</div>
		),
		[title, description]
	);

	const renderCourseSections = useMemo(
		() => (
			<div className="grid grid-cols-1 gap-4">
				{sections.map((section, index) => (
					<Fragment key={title}>
						<Section
							caption={`Section ${index + 1}`}
							section={section}
							index={index + 1}
						/>
					</Fragment>
				))}
			</div>
		),
		[sections, title]
	);

	return (
		<SlantedBackgroundTemplate header={renderCourseHeader}>
			{renderCourseSections}
		</SlantedBackgroundTemplate>
	);
};

export default Course;
