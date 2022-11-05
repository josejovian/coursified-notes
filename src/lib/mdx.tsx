import { ChapterType } from "../type/Course";

const { readdirSync, readFileSync } = require("fs");
const { join } = require("path");

const BASE_MATERIALS_DIRECTORY = "src/materials";

async function readProject(id: string) {
	const result = await readFileSync(
		join(process.cwd(), BASE_MATERIALS_DIRECTORY, `${id}.mdx`),
		"utf8"
	);

	return result;
}

async function readAllCourses() {
	const result = await readdirSync(
		join(process.cwd(), BASE_MATERIALS_DIRECTORY),
		"utf8"
	);
	return result;
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

async function readChapters(course: String) {
	const result = readdirSync(
		join(process.cwd(), `${BASE_MATERIALS_DIRECTORY}/${course}`),
		"utf8"
	);
	return result;
}

// async function getChapter(course: string, section: string, chapter: string) {
// 	const result = await readChapter(course, section, chapter);
// 	const data = await bundleMDX({
// 		source: result,
// 	});

// 	const { id, title }: ChapterType = data.frontmatter;

// 	return {
// 		id: id,
// 		title: title,
// 	};
// }

// async function getProject(_id: string) {
// 	const result = await readProject(_id);

// 	const data = await bundleMDX({
// 		source: result,
// 	});

// 	const { id, title }: ChapterType = data.frontmatter;

// 	return {
// 		id: id,
// 		title: title,
// 	};
// }

// async function getProjects() {
// 	const projects = await readProjects();
// 	const result = await Promise.all(
// 		projects.map(async (filename: string) => {
// 			const data = await bundleMDX({
// 				source: readFileSync(
// 					join(process.cwd(), "projects", `${filename}`),
// 					"utf8"
// 				),
// 			});
// 			const { id, title }: ChapterType = data.frontmatter;

// 			return {
// 				id: id,
// 				title: title,
// 			};
// 		})
// 	);

// 	return result;
// }

module.exports = {
	readProject,
	readChapter,
	readAllChapters,
	readAllCourses,
	readAllSections,
	// readProjects,
	// getProject,
	// getProjects,
};
