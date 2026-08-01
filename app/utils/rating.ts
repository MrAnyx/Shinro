import type { BadgeProps } from "@nuxt/ui";

export const getRatingColor = (vote: number): BadgeProps["color"] => {
	if (vote >= 7) {
		return "success";
	} else if (vote >= 5) {
		return "warning";
	} else {
		return "error";
	}
};
