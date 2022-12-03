import { StylePropsType, ToastType } from "../type";
import {
	BsCheck,
	BsCheckCircleFill,
	BsFillExclamationCircleFill,
	BsFillExclamationTriangleFill,
	BsFillInfoCircleFill,
} from "react-icons/bs";
import { BaseQuoteProps } from "../components";

export const BLOCKQUOTE_PRESETS = [
	"formula",
	"explanation",
	"example",
	"theorem",
] as const;

export type BlockquotePresetType = typeof BLOCKQUOTE_PRESETS[number];

export const BLOCKQUOTE_PRESET_CLASS: StylePropsType<
	BlockquotePresetType,
	BaseQuoteProps
> = {
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

export const TOAST_PRESETS = [
	"success",
	"warning",
	"danger",
	"information",
	"default",
] as const;

export type ToastPresetType = typeof TOAST_PRESETS[number];

export const TOAST_PRESET_CLASS: StylePropsType<ToastPresetType, ToastType> = {
	success: {
		color: "success",
		icon: <BsCheckCircleFill />,
	},
	warning: {
		color: "warning",
		icon: <BsFillExclamationTriangleFill />,
	},
	danger: {
		color: "danger",
		icon: <BsFillExclamationCircleFill />,
	},
	information: {
		color: "information",
		icon: <BsFillInfoCircleFill />,
	},
	default: {
		color: "secondary",
	},
};
