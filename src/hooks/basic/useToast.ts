import { useCallback, useContext } from "react";
import { ToastType } from "../../type";
import { checkCourseProgress, ToastContext } from "../../utils";

export function useToast() {
	const setToasts = useContext(ToastContext);

	const addToast = useCallback(
		(toast: ToastType) => {
			setToasts(
				(prev: ToastType[]) =>
					[
						...prev,
						{
							...toast,
							id: `${new Date().toISOString()}`,
						},
					] as ToastType[]
			);
		},
		[setToasts]
	);

	return addToast;
}
