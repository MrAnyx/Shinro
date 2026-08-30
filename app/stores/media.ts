export const useMediaStore = defineStore("media", {
	state: () => ({}),
	getters: {
		total() {
			const movieStore = useMovieStore();

			return movieStore.total;
		},
	},
	actions: {},
});
