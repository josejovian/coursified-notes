export const REQUIREMENT_TYPES = {
	read: "Read the material",
	practice: "Solve all practice problems",
};

export type RequirementCategoryType = keyof typeof REQUIREMENT_TYPES;

export interface RequirementType {
	category: RequirementCategoryType;
	description?: string;
	completed?: boolean;
}

export interface ChapterType {
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
