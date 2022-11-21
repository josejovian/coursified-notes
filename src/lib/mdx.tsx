import {
	CourseType,
	ChapterType,
	PageType,
	PracticeType,
	RequirementCategoryType,
	RequirementMap,
	RequirementType,
	SectionType,
} from "../type/Course";
import { getPracticeAnswer, getPracticeId } from "../utils/course";

const { readdirSync, readFileSync } = require("fs");
const { join } = require("path");

const BASE_MATERIALS_DIRECTORY = "src/materials";

async function readCourse(course: string) {
	const result = await readFileSync(
		join(process.cwd(), BASE_MATERIALS_DIRECTORY, `${course}/index.json`),
		"utf8"
	);

	return result;
}

async function readAllCourses() {
	const result: string[] = await readdirSync(
		join(process.cwd(), BASE_MATERIALS_DIRECTORY),
		"utf8"
	);
	return result;
}

async function readSection(course: string, section: string) {
	const result = await readFileSync(
		join(
			process.cwd(),
			`${BASE_MATERIALS_DIRECTORY}/${course}/${section}/index.json`
		),
		"utf8"
	);
	return JSON.parse(result);
}

async function readAllSections(course: string) {
	const result = await readdirSync(
		join(process.cwd(), `${BASE_MATERIALS_DIRECTORY}/${course}`),
		"utf8"
	);
	return result;
}

async function readAllChapters(course: string, section: string) {
	const result = await readdirSync(
		join(process.cwd(), `${BASE_MATERIALS_DIRECTORY}/${course}/${section}`),
		"utf8"
	);
	return result;
}

async function readChapter(course: string, section: string, chapter: string) {
	const result = readFileSync(
		join(
			process.cwd(),
			`${BASE_MATERIALS_DIRECTORY}/${course}/${section}/${chapter}.mdx`
		),
		"utf8"
	);
	return result;
}

function sortData(data: any[], index: any[], variable: string = "id") {
	return data.sort((a, b) => {
		if (a[variable] && b[variable]) {
			const indexA = index.indexOf(a.id);
			const indexB = index.indexOf(b.id);

			if (indexA > indexB) return 1;
			if (indexA == indexB) return 0;
			if (indexA < indexB) return -1;
		}
		return 0;
	});
}

async function getDetailedCourse(course: string) {
	let result = await readCourse(course);
	result = JSON.parse(result) as CourseType;
	result.id = course;

	const sections = await readAllSections(course);

	const sectionsData = (await Promise.all(
		sections.map(async (section: string) => {
			if (section.includes(".")) {
				return null;
			}

			const { title = section, overrideChapterTitles } =
				await readSection(course, section);

			const sectionData: SectionType = {
				id: section,
				title: title,
				chapters: [],
			};

			const chapters = await readAllChapters(course, section);

			const detectedChapters = (await Promise.all(
				chapters.map(async (chapterRaw: string) => {
					const [chapter, extension] = chapterRaw.split(".");

					if (extension === "json") return null;

					const chapterContents = await readChapter(
						course,
						section,
						chapter
					);
					const pages = chapterContents.split(/\=\=\=/);

					let countQuestions = 0;

					const completePages = pages.map((page: any): PageType => {
						let pageType: RequirementCategoryType = "read";

						const questions = (
							page.match(/\[input;([^\\])*([^\`])*/) ?? []
						)
							.map((question: string) => {
								pageType = "practice";
								const [id, answer] = [
									getPracticeId(question),
									getPracticeAnswer(question),
								];
								if (id && answer) countQuestions++;
								return {
									id,
									answer,
								};
							})
							.filter((q: PracticeType) => q.id && q.answer);

						return {
							category: pageType,
							problems: questions,
						};
					}, []);

					let requirements: RequirementMap = {
						read: undefined,
						practice: undefined,
					};

					if (completePages.length > 0) {
						requirements = {
							...requirements,
							read: {
								category: "read",
								params: {
									number: completePages.length,
								},
							},
						};
					}

					if (countQuestions > 0) {
						requirements = {
							...requirements,
							practice: {
								category: "practice",
								params: {
									number: countQuestions,
								},
							},
						};
					}

					return {
						id: chapter,
						title: overrideChapterTitles
							? overrideChapterTitles[chapter]
							: chapter ?? chapter,
						requirements,
						pages: completePages,
					} as ChapterType;
				})
			)
				.then((result) => result.filter((x) => x))
				.catch()) as ChapterType[];

			const topicIndexees = Object.keys(overrideChapterTitles);

			sectionData.chapters = sortData(detectedChapters, topicIndexees);
			// detectedChapters.sort((a, b) => {
			// 	if (a.id && b.id) {
			// 		const indexA = topicIndexees.indexOf(a.id);
			// 		const indexB = topicIndexees.indexOf(b.id);

			// 		if (indexA > indexB) return 1;
			// 		if (indexA == indexB) return 0;
			// 		if (indexA < indexB) return -1;
			// 	}
			// 	return 0;
			// });
			return sectionData;
		})
	)
		.then((result) => result.filter((x) => x))
		.catch()) as SectionType[];

	const topicIndexes = Object.values(result.sections);
	result.sections = sortData(sectionsData, topicIndexes);
	console.log(topicIndexes);
	return result;
}

module.exports = {
	readCourse,
	readChapter,
	readAllChapters,
	readAllCourses,
	readAllSections,
	getDetailedCourse,
};
