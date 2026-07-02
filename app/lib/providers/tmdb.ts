import { defineProvider } from "@nuxt/image/runtime";
import { joinURL } from "ufo";

const TMDB_SIZES = [92, 154, 185, 342, 500, 780];

export default defineProvider<{ baseURL?: string; imageSize?: string }>({
	getImage(src, { modifiers, baseURL = "", imageSize = "" }) {
		let size = imageSize;

		if (modifiers?.width) {
			const requestedWidth = parseInt(String(modifiers.width), 10);

			if (!isNaN(requestedWidth)) {
				const match = TMDB_SIZES.find((w) => w >= requestedWidth);
				size = match ? `w${match}` : "original";
			}
		}

		return {
			url: joinURL(baseURL, size, src),
		};
	},
});
