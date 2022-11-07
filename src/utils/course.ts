import { ChapterAddressType } from "../type/Course";

export function getLocalChapterAddress(
	section: string,
	chapter: string,
	page: number
) {
	return `${section}/${chapter}/${page}`;
}

export function getCourseKey(course: string) {
	return `course-${course}`;
}

export function storeChapterProgress(
	chapterAddress: ChapterAddressType,
	answer: string | number
): void {
	const { course, section, chapter, page } = chapterAddress;
	const localAddress = getLocalChapterAddress(section, chapter, page ?? 0);
	const existingAnswer = JSON.parse(
		localStorage.getItem(getCourseKey(course)) ?? "{}"
	);
	existingAnswer[localAddress] = answer.toString();

	localStorage.setItem(getCourseKey(course), JSON.stringify(existingAnswer));
}

export function checkChapterProgress(
	chapterAddress: ChapterAddressType
): string | null {
	const { course, section, chapter, page } = chapterAddress;
	const localAddress = getLocalChapterAddress(section, chapter, page ?? 0);

	let existingAnswer = localStorage.getItem(getCourseKey(course));

	if (existingAnswer) {
		const parsed = JSON.parse(existingAnswer);
		return parsed[localAddress];
	}

	return null;
}
