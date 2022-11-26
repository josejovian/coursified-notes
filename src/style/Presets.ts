import { StylePropsType } from "../type";

export const BLOCKQUOTE_PRESETS = [
	"formula",
	"explanation",
	"example",
	"theorem",
] as const;

export type BlockquotePresetType = typeof BLOCKQUOTE_PRESETS[number];

export const BLOCKQUOTE_PRESET_CLASS: StylePropsType<BlockquotePresetType> = {
	formula: {
		color: "primary",
	},
	explanation: {
		color: "success",
	},
	example: {
		color: "warning",
	},
	theorem: {
		color: "information",
	},
};
