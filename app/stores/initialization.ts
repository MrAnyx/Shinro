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
				const collectionStore = useCollectionStore();
				this.isLoading = true;
				await Promise.all([collectionStore.initialize()]);
				this.isReady = true;
			} finally {
				this.isLoading = false;
			}
		},
	},
});
