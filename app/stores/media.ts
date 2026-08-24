export const useMediaStore = defineStore("media", {
	state: () => ({}),
	getters: {
		total() {
			const movieStore = useMovieStore();
			const serieStore = useSerieStore();
			const bookStore = useBookStore();
			const musicStore = useMusicStore();
			const gameStore = useGameStore();

			return movieStore.total + serieStore.total + bookStore.total + musicStore.total + gameStore.total;
		},
	},
	actions: {},
});
