import clsx from "clsx";
import { Fragment, useCallback, useMemo, useState } from "react";
import CourseType, {
	ChapterType,
	RequirementType,
	REQUIREMENT_TYPES,
	SectionType,
} from "@/src/type/Course";
import { BsCheckSquareFill, BsChevronLeft, BsSquare } from "react-icons/bs";
import ProgressVertical from "@/src/compponents/basic/ProgressVertical/ProgressVertical";

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
		progress: 5,
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
		progress: 2,
	},
];

const DUMMY: CourseType = {
	title: "Calculus I",
	description: `The notes I took for my Calculus course in the second semester.`,
	sections: DUMMY_CHAPTERS,
};

const CHAPTER_BASE_STYLEN = "transition-colors";
const CHAPTER_LOCKED_STYLE = "bg-secondary-1";
const CHAPTER_UNLOCKED_STYLE = "bg-warning-1 hover:bg-warning-2";
const CHAPTER_COMPLETED_STYLE = "bg-success-1 hover:bg-success-2";

interface SectionProps {
	section: SectionType;
	caption?: string;
	index?: number;
}

export default function Section({ section, caption, index }: SectionProps) {
	const { title, chapters } = section;

	const [open, setOpen] = useState(true);

	const handleCheckChapterIsComplete = useCallback(
		(requirements: RequirementType[] | undefined) => {
			if (!requirements) return false;

			const allRequirementsCompleted = requirements.filter(
				(requirement) => requirement.completed
			);
			return allRequirementsCompleted.length === requirements.length;
		},
		[]
	);

	const lastFinishedChapter = useMemo(() => {
		let lastFinishedChapter = 0;

		chapters.forEach((chapter, idx) => {
			if (chapter.requirements) {
				if (handleCheckChapterIsComplete(chapter.requirements))
					lastFinishedChapter = idx + 1;
			}
		});

		return lastFinishedChapter;
	}, [chapters, handleCheckChapterIsComplete]);

	const handleGetStylingForChapter = useCallback(
		(chapters: ChapterType[], index: number) => {
			const SPECIFIC_STYLE = (function () {
				if (chapters[index].requirements) {
					if (
						handleCheckChapterIsComplete(
							chapters[index].requirements
						)
					)
						return CHAPTER_COMPLETED_STYLE;

					if (
						chapters[index - 1] &&
						chapters[index - 1].requirements
					) {
						if (
							handleCheckChapterIsComplete(
								chapters[index - 1].requirements
							)
						) {
							return CHAPTER_UNLOCKED_STYLE;
						}
					}
				}

				if (index === 0) return CHAPTER_UNLOCKED_STYLE;

				return CHAPTER_LOCKED_STYLE;
			})();
			return clsx(CHAPTER_BASE_STYLEN, SPECIFIC_STYLE);
		},
		[handleCheckChapterIsComplete]
	);

	const renderChapterRequirements = useCallback(
		(section: string, requirements: RequirementType[]) => {
			return (
				<Fragment>
					<ul className="flex flex-col gap-2 mt-2">
						{requirements.map((requirement, idx) => (
							<li
								key={`${section}-${idx}`}
								className={clsx("flex items-center gap-2")}
							>
								<span
									className={clsx(
										"Icon",
										requirement.completed
											? "text-green-600"
											: "text-gray-700"
									)}
								>
									{requirement.completed ? (
										<BsCheckSquareFill />
									) : (
										<BsSquare />
									)}
								</span>
								<span className="text-gray-600 text-sm">
									{REQUIREMENT_TYPES[requirement.category]}
								</span>
							</li>
						))}
					</ul>
				</Fragment>
			);
		},
		[]
	);

	return (
		<article
			className={clsx(clsx("border-gray-300 border", "rounded-md"))}
			key={title}
		>
			<div
				className="p-8 w-full flex justify-between items-center cursor-pointer"
				onClick={() => setOpen((prev) => !prev)}
			>
				<div>
					{caption && (
						<span className="text-secondary-7 text-xl">
							{caption}
						</span>
					)}
					<h2 className="font-semibold text-primary-6">{title}</h2>
				</div>
				<div className="flex items-center gap-8">
					<span className="text-secondary-6">
						{lastFinishedChapter} / {chapters.length}
					</span>
					<span
						className={clsx(
							"Icon-xl transition-all text-primary-6",
							open ? "-rotate-90" : "rotate-0"
						)}
					>
						<BsChevronLeft />
					</span>
				</div>
			</div>
			{open && (
				<div className="px-8 pb-8">
					<ProgressVertical
						title={title}
						milestones={chapters.map((chapter) => chapter.title)}
						indexTemplate={(idx) => `Chapter ${index}.${idx}`}
						captions={chapters.map((chapter) =>
							renderChapterRequirements(
								chapter.title,
								chapter.requirements ?? []
							)
						)}
						progress={lastFinishedChapter}
						stylings={chapters.map((chapter, idx) =>
							handleGetStylingForChapter(chapters, idx)
						)}
						links={chapters.map((chapter, idx) =>
							idx === 0 ||
							handleCheckChapterIsComplete(
								chapter.requirements
							) ||
							handleCheckChapterIsComplete(
								chapters[idx - 1].requirements
							)
								? `/${idx}`
								: "#"
						)}
					/>
				</div>
			)}
		</article>
	);
}
