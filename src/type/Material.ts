import { ChapterAddressType } from "./Course";

export const CUSTOM_MATERIAL = {
	graph: "GraphContainer",
	input: "InputBox",
	match: "MatchBox",
};

export type CustomMaterialType = keyof typeof CUSTOM_MATERIAL;

export type AnswerType = { [key: string]: string };

export type AddressesType = {
	[key: string]: ChapterAddressType;
};

export type InputBoxElementType = {
	parentElement: HTMLElement;
	string: string;
};

export type MatchBoxElementType = {
	parentElement: HTMLElement;
	pair: [string, string];
	id: string;
};
