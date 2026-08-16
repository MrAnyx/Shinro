export const useMediaStore = defineStore("media", {
	state: () => ({}),
	getters: {
		total() {
			const movieStore = useMovieStore();
			const serieStore = useSerieStore();

			return movieStore.total + serieStore.total;
		},
	},
	actions: {},
});
