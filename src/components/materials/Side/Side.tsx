import { Fragment, useState, useCallback, useEffect, useMemo } from "react";
import {
	ChapterAddressType,
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
import { useProgress } from "@/src/hooks";
import { getLastFinishedChapter } from "@/src/utils/materials";

interface SideProps {
	courseDetail: CourseType;
	chapterAddress: ChapterAddressType;
	trueLoading?: boolean;
}

export function Side({ courseDetail, chapterAddress, trueLoading }: SideProps) {
	const { id, title, sections, description } = courseDetail;

	const sectionData = useProgress({ id, sections });

	const chapterIsActive = useCallback(
		(section: string, chapter: string) => {
			return (
				section === chapterAddress.section &&
				chapter === chapterAddress.chapter
			);
		},
		[chapterAddress.chapter, chapterAddress.section]
	);

	const renderChapterEntry = useCallback(
		(
			idx1: number,
			idx2: number,
			name: string,
			status: string,
			active: boolean
		) => {
			return (
				<div
					className={clsx("CourseMaterial_entry", [
						status === "completed" && [
							"border-r-4 border-r-green-200 hover:bg-success-2",
							active && "bg-success-1 hover:bg-success-2",
						],
						status === "ongoing" && [
							"border-r-4 border-r-yellow-200 hover:bg-warning-2",
							active && "bg-warning-1 hover:bg-warning-2",
						],
						status === "locked" && [
							"CourseMaterial_entry-locked bg-secondary-1",
						],
					])}
				>
					<div className="CourseMaterial_index">
						{idx1}.{idx2}
					</div>
					{name}
				</div>
			);
		},
		[]
	);

	const renderSections = useMemo(
		() =>
			sectionData &&
			sectionData.map((section, idx1) => {
				idx1++;

				const _id = section.id ?? "";
				const _title = section.title;
				const chapters = section.chapters;
				const sectionId = `Side_section-${_id}`;
				const lastCompletedChapter = getLastFinishedChapter(chapters);

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

							const __id = chapter.id ?? "";
							const __title = chapter.title;
							const chapterId = `Side_section-${_id}-${__id}`;

							let status = "locked";
							if (lastCompletedChapter >= idx2) {
								status = "completed";
							} else if (lastCompletedChapter === idx2 - 1) {
								status = "ongoing";
							}

							const active = chapterIsActive(_id, __id);

							const entry = renderChapterEntry(
								idx1,
								idx2,
								__title,
								status,
								active
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
		[sectionData, trueLoading, chapterIsActive, renderChapterEntry, id]
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
