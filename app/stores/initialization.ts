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

				const { enableMovies } = useClientConfig();
				const collectionStore = useCollectionStore();
				const movieStore = useMovieStore();

				await Promise.all([collectionStore.initialize(), enableMovies ? movieStore.initialize() : undefined]);

				this.isReady = true;
			} finally {
				this.isLoading = false;
			}
		},
	},
});
