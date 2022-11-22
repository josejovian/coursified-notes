import { Fragment, useCallback, useMemo } from "react";
import {
	ChapterType,
	CourseType,
	RequirementMap,
	RequirementType,
	SectionType,
} from "@/src/type";
import clsx from "clsx";
import { useRouter } from "next/router";
import Link from "next/link";
import { Badge } from "@/src/components";
import { checkCourseProgress } from "@/src/utils";

interface SideProps {
	courseDetail: CourseType;
}

export function Side({ courseDetail }: SideProps) {
	const { id, title, sections, description } = courseDetail;

	const sectionProgresses = useMemo(
		() => checkCourseProgress(id, sections),
		[id, sections]
	);

	const completeSections = useMemo(
		() =>
			sectionProgresses &&
			sections.map((section: SectionType, index: number) => ({
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
			})),
		[sectionProgresses, sections]
	);

	const renderChapterEntry = useCallback(
		(idx1: number, idx2: number, name: string, status: string) => {
			let className = "";

			switch (status) {
				case "completed":
					className =
						"border-r-4 border-r-green-200 hover:bg-success-2";
					break;
				case "ongoing":
					className =
						"border-r-4 border-r-yellow-200 hover:bg-warning-2";
					break;
				case "locked":
					className = "CourseMaterial_entry-locked bg-secondary-1";
					break;
			}

			return (
				<div className={clsx("CourseMaterial_entry", className)}>
					<div className="CourseMaterial_index">
						{idx1}.{idx2}
					</div>
					{name}
				</div>
			);
		},
		[]
	);

	const handleArraifyRequirements = useCallback(
		(requirements: RequirementMap | undefined): RequirementType[] => {
			return requirements
				? (Object.entries(requirements)
						.filter((x) => x)
						.map(([key, value]) => ({
							...value,
							category: key,
						})) as RequirementType[])
				: [];
		},
		[]
	);

	const handleCheckChapterIsComplete = useCallback(
		(requirements: RequirementType[] | undefined) => {
			if (!requirements) return false;

			const allRequirementsCompleted = requirements.filter(
				(requirement) =>
					requirement.completed ||
					(requirement.params &&
						requirement.params.number &&
						requirement.params.progress &&
						requirement.params.number ==
							requirement.params.progress) ||
					!requirement.params
			);
			return allRequirementsCompleted.length === requirements.length;
		},
		[]
	);

	const lastFinishedChapterOfASection = useCallback(
		(chapters: ChapterType[]) => {
			let result = 0;

			chapters.forEach((chapter, idx) => {
				if (chapter.requirements) {
					if (
						handleCheckChapterIsComplete(
							handleArraifyRequirements(chapter.requirements)
						)
					)
						result = idx + 1;
				}
			});

			return result;
		},
		[handleArraifyRequirements, handleCheckChapterIsComplete]
	);

	const renderSections = useMemo(
		() =>
			completeSections.map((section, idx1) => {
				idx1++;

				const _id = section.id;
				const _title = section.title;
				const chapters = section.chapters;
				const sectionId = `Side_section-${id}`;
				const lastCompletedChapter =
					lastFinishedChapterOfASection(chapters);

				return (
					<Fragment key={sectionId}>
						<div className="CourseMaterial_header CourseMaterial_entry">
							<>
								<div className="CourseMaterial_index">
									{idx1}
								</div>
								{_title}
							</>
							<Badge className="absolute right-8">
								<>
									{lastCompletedChapter} / {chapters.length}
								</>
							</Badge>
						</div>
						{chapters.map((chapter, idx2) => {
							idx2++;

							const __id = chapter.id;
							const __title = chapter.title;
							const chapterId = `Side_section-${__id}-${__title}`;

							let status = "locked";
							if (lastCompletedChapter >= idx2) {
								status = "completed";
							} else if (lastCompletedChapter >= idx2 - 1) {
								status = "ongoing";
							}

							const entry = renderChapterEntry(
								idx1,
								idx2,
								__title,
								status
							);

							return lastCompletedChapter >= idx2 - 1 ||
								idx2 === 0 ? (
								<Link
									href={`/course/${id}/${_id}/${__id}`}
									key={chapterId}
									passHref
								>
									<a>{entry}</a>
								</Link>
							) : (
								<Fragment key={chapterId}>{entry}</Fragment>
							);
						})}
					</Fragment>
				);
			}),
		[
			completeSections,
			id,
			lastFinishedChapterOfASection,
			renderChapterEntry,
		]
	);

	return (
		<aside id="CourseMaterial_side" className="shadow-lg">
			<div className="p-8">
				<h2 className="font-bold mb-2">{title}</h2>
				<p>{description}</p>
			</div>
			<hr />
			{renderSections}
		</aside>
	);
}
