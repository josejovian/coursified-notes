import { useMemo } from "react";
import { CourseType } from "@/src/type";
import clsx from "clsx";
import { useRouter } from "next/router";
import Link from "next/link";

interface SideProps {
	courseDetail: CourseType;
}

export function Side({ courseDetail }: SideProps) {
	const { id, title, sections, description } = courseDetail;

	const renderSections = useMemo(
		() =>
			sections.map((section, idx1) => {
				const _id = section.id;
				const _title = section.title;
				const { chapters } = section;

				idx1++;

				const sectionId = `Side_section-${id}`;

				return (
					<>
						<div
							key={sectionId}
							className="CourseMaterial_header CourseMaterial_entry"
						>
							<div className="CourseMaterial_index">{idx1}</div>
							{_title}
						</div>
						{chapters.map((chapter, idx2) => {
							idx2++;

							const __id = chapter.id;
							const __title = chapter.title;
							const chapterId = `Side_section-${__id}-${__title}`;
							return (
								<Link
									href={`/course/${id}/${_id}/${__id}`}
									key={chapterId}
									passHref
								>
									<a>
										<div className="CourseMaterial_entry">
											<div className="CourseMaterial_index">
												{idx1}.{idx2}
											</div>
											{__title}
										</div>
									</a>
								</Link>
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
				<p>{description}</p>
			</div>
			<hr />
			{renderSections}
		</aside>
	);
}
