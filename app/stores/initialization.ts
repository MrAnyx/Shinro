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

			const userStore = useUserStore();
			const userId = userStore.user?.id;
			const episodeStore = useEpisodeStore();
			const { sessionRevision } = episodeStore;
			try {
				this.isLoading = true;

				const collectionStore = useCollectionStore();
				const movieStore = useMovieStore();
				const serieStore = useSerieStore();
				const seasonStore = useSeasonStore();
				const config = useClientConfig();

				await Promise.all([
					collectionStore.initialize(),
					...(config.enableMovies ? [movieStore.initialize()] : []),
					...(config.enableSeries
						? [serieStore.initialize(), seasonStore.initialize(), episodeStore.initialize()]
						: []),
				]);

				if (userStore.user?.id === userId && episodeStore.sessionRevision === sessionRevision) {
					this.isReady = true;
				}
			} finally {
				if (userStore.user?.id === userId && episodeStore.sessionRevision === sessionRevision) {
					this.isLoading = false;
				}
			}
		},
	},
});
