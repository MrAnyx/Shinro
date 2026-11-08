export const useInitializationStore = defineStore("initialization", {
	state: () => ({
		isLoading: false,
		isReady: false,
	}),
	getters: {
		isFullyInitialized: (state) => !state.isLoading && state.isReady,
	},
	actions: {
		async initialize() {
			if (this.isReady) {
				return;
			}

			try {
				this.isLoading = true;

				const collectionStore = useCollectionStore();
				const movieStore = useMovieStore();
				const serieStore = useSerieStore();

				await Promise.all([collectionStore.initialize(), movieStore.initialize(), serieStore.initialize()]);

				this.isReady = true;
			} finally {
				this.isLoading = false;
			}
		},
	},
});
