const REQUIREMENT_TYPES = ["read", "practice"] as const;

export type RequirementCategoryType = typeof REQUIREMENT_TYPES[number];

export interface RequirementType {
	category?: RequirementCategoryType;
	description?: string;
	completed?: boolean;
	params?: any;
}

export type RequirementMap =
	| {
			[key in RequirementCategoryType]: RequirementType | undefined;
	  };

// export interface RequirementMap {
// 	[key in RequirementCategoryType]: RequirementType;
// }

export interface PracticeType {
	id: string;
	answer: any;
}

export interface PageType {
	category: RequirementCategoryType;
	problems?: PracticeType[];
	completed?: boolean;
}

export interface ChapterType {
	id?: string;
	title: string;
	pages?: PageType[];
	requirements?: RequirementMap;
	percentage?: number;
	completed?: boolean;
}

export interface SectionType {
	id?: string;
	title: string;
	chapters: ChapterType[];
	progress?: number;
}

export default interface CourseType {
	id?: string;
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
