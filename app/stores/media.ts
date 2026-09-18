export const useMediaStore = defineStore("media", {
	state: () => ({}),
	getters: {
		total() {
			const movieStore = useMovieStore();
			const serieStore = useSerieStore();

			return [movieStore.total, serieStore.total].reduce((acc, curr) => acc + curr, 0);
		},
	},
	actions: {},
});
