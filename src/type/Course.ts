const REQUIREMENT_TYPES = ["read", "practice"];

export const REQUIREMENT_MESSAGE: {
	[K in typeof REQUIREMENT_TYPES[number]]: string;
} = {
	read: "Read the material",
	practice: "Solve all practice problems",
};

export type RequirementCategoryType = typeof REQUIREMENT_TYPES[number];

export interface RequirementType {
	category: RequirementCategoryType;
	description?: string;
	completed?: boolean;
}

export interface ChapterType {
	id?: string;
	title: string;
	requirements?: RequirementType[];
	completed?: boolean;
}

export interface SectionType {
	title: string;
	chapters: ChapterType[];
	progress?: number;
}

export default interface CourseType {
	title: string;
	description: string;
	sections: SectionType[];
}

export interface ChapterAddressType {
	course: string;
	section: string;
	chapter: string;
	page?: number;
}
