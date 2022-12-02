import { ToastType } from "@/src/type";
import { ToastContext } from "@/src/utils";
import { render } from "katex";
import type { AppProps } from "next/app";
import { useCallback, useEffect, useMemo, useState } from "react";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
	const [toasts, setToasts] = useState<ToastType[]>([]);

	const handleProcessToast = useCallback(() => {
		const toast = toasts.at(-1);

		if (toast) {
			const { id, duration = 4 } = toast;
			setTimeout(() => {
				setToasts((prev: ToastType[]) =>
					prev.filter((x) => x.id !== id)
				);
			}, duration * 1000);
		}
	}, [toasts]);

	const renderToasts = useMemo(() => {
		return (
			<div className="fixed bottom-16 right-16 z-50">
				{toasts.map(({ id, title, message }) => (
					<div className="p-8" key={id}>
						{title}
						{message}
					</div>
				))}
			</div>
		);
	}, [toasts]);

	useEffect(() => {
		if (toasts.length) {
			handleProcessToast();
		}
	}, [handleProcessToast, toasts]);

	return (
		<ToastContext.Provider value={setToasts}>
			{renderToasts}
			<Component {...pageProps} />
		</ToastContext.Provider>
	);
}

export default MyApp;
