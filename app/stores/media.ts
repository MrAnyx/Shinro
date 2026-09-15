import { sum } from "es-toolkit";

export const useMediaStore = defineStore("media", {
	state: () => ({}),
	getters: {
		total() {
			const movieStore = useMovieStore();
			const serieStore = useSerieStore();

			return sum([movieStore.total, serieStore.total]);
		},
	},
	actions: {},
});
