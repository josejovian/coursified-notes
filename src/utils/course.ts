import { ChapterAddressType } from "../type/Course";

export const regexPracticeInput = /\[input\;([^\\])*\]/g;
export const regexPracticeInputWithAnswer = /\[input\;([^\`])*/g;

export function getPracticeId(string: string) {
	const split = (string.match(regexPracticeInput) ?? [""])[0].split(";");

	if (split.length !== 2) return null;

	return split[1].slice(0, -1);
}

export function getPracticeAnswer(string: string) {
	const answer = string.match(regexPracticeInputWithAnswer) ?? [];

	if (answer.length !== 1) return null;

	const question = answer[0].replace(regexPracticeInput, "");

	return question;
}

export function getLocalChapterAddress(
	section: string,
	chapter: string,
	page?: number
) {
	return page ? `${section}/${chapter}/${page}` : `${section}/${chapter}`;
}

export function getCourseKey(course: string) {
	return `course-${course}`;
}

export function storeChapterProgress(
	chapterAddress: ChapterAddressType,
	answer: any
): void {
	const { course, section, chapter, page } = chapterAddress;
	const localAddress = getLocalChapterAddress(section, chapter);
	const existingAnswer = JSON.parse(
		localStorage.getItem(getCourseKey(course)) ?? "{}"
	);
	if (page !== undefined) {
		if (!existingAnswer[localAddress]) {
			existingAnswer[localAddress] = [];
		}
		existingAnswer[localAddress][page] = answer;
	} else {
		if (!existingAnswer[localAddress]) {
			existingAnswer[localAddress] = {};
		}
		existingAnswer[localAddress] = answer;
	}

	localStorage.setItem(getCourseKey(course), JSON.stringify(existingAnswer));
}

export function checkChapterProgress(
	chapterAddress: ChapterAddressType
): { [key: string]: string } | null {
	const { course, section, chapter, page } = chapterAddress;
	const localAddress = getLocalChapterAddress(section, chapter);

	let existingAnswer = localStorage.getItem(getCourseKey(course));

	if (existingAnswer) {
		const parsed = JSON.parse(existingAnswer)[localAddress] ?? {};
		return parsed;
	}

	return null;
}
