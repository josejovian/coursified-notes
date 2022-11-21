import { useMemo } from "react";
import { CourseType } from "@/src/type";
import clsx from "clsx";

interface SideProps {
	courseDetail: CourseType;
}

export function Side({ courseDetail }: SideProps) {
	const { title, sections } = courseDetail;

	const renderSections = useMemo(
		() =>
			sections.map(({ id, title, chapters }) => {
				const sectionId = `Side_section-${id}`;

				return (
					<>
						<div key={sectionId} className="CourseMaterial_entry">
							{title}
						</div>
						{chapters.map((chapter) => {
							const _id = chapter.id;
							const _title = chapter.title;
							const chapterId = `Side_section-${_id}-${_title}`;
							return (
								<div
									key={chapterId}
									className="CourseMaterial_entry"
								>
									{_title}
								</div>
							);
						})}
					</>
				);
			}),
		[sections]
	);

	return (
		<aside id="CourseMaterial_side" className="shadow-lg">
			<div className="p-8">
				<h2>{title}</h2>
			</div>
			<hr />
			{renderSections}
		</aside>
	);
}
