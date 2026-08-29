import type { ToastProps } from "@nuxt/ui";

type StatusToastOptions = Omit<ToastProps, "color" | "icon" | "type">;

const ICONS = {
	success: "i-lucide-circle-check",
	info: "i-lucide-info",
	warning: "i-lucide-triangle-alert",
	error: "i-lucide-circle-x",
	neutral: "i-lucide-bell",
} as const;

type StatusColor = keyof typeof ICONS;

export const useStatusToast = () => {
	const toast = useToast();

	const notify = (color: StatusColor, opts: StatusToastOptions, type: ToastProps["type"] = "foreground") => {
		return toast.add({
			...opts,
			icon: ICONS[color],
			color,
			type,
		});
	};

	return {
		success: (opts: StatusToastOptions) => notify("success", { title: "Success", ...opts }),
		info: (opts: StatusToastOptions) => notify("info", { title: "Information", ...opts }),
		warning: (opts: StatusToastOptions) => notify("warning", { title: "Warning", ...opts }),
		neutral: (opts: StatusToastOptions) => notify("neutral", { title: "Information", ...opts }),

		error: (error: unknown, opts: StatusToastOptions = {}) => {
			let description = "An error occurred";

			if (typeof error === "string") {
				description = error;
			} else if (isTRPCError(error)) {
				description = error.message;
			} else if (error instanceof Error) {
				description = error.message;
			}

			return notify("error", { title: "Error", description, ...opts });
		},
	};
};
