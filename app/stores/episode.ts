export const useEpisodeStore = defineStore("episode", {
	state: () => ({
		total: 0,
		revision: 0,
		sessionRevision: 0,
	}),
	actions: {
		async initialize() {
			const trpc = useTrpc();
			const userStore = useUserStore();
			const userId = userStore.user?.id;
			const { revision, sessionRevision } = this;
			const total = await trpc.episode.count.query();
			if (userStore.user?.id !== userId || this.sessionRevision !== sessionRevision) {
				return;
			}
			if (revision !== this.revision) {
				await this.initialize();
				return;
			}
			this.total = total;
		},
		invalidate() {
			this.revision += 1;
		},
		resetSession() {
			this.invalidate();
			this.sessionRevision += 1;
			this.total = 0;
		},
		async createEpisodeFromExternal(payload: TRPCProcedureInput<"episode", "createFromExternal">) {
			const trpc = useTrpc();
			const userStore = useUserStore();
			const userId = userStore.user?.id;
			const { sessionRevision } = this;
			const episode = await trpc.episode.createFromExternal.mutate(payload);
			if (userStore.user?.id === userId && this.sessionRevision === sessionRevision) {
				this.invalidate();
				this.total += 1;
			}
			return episode;
		},
		async deleteEpisode(payload: TRPCProcedureInput<"episode", "delete">) {
			const trpc = useTrpc();
			const userStore = useUserStore();
			const userId = userStore.user?.id;
			const { sessionRevision } = this;
			await trpc.episode.delete.mutate(payload);
			if (userStore.user?.id === userId && this.sessionRevision === sessionRevision) {
				this.invalidate();
				this.total = Math.max(0, this.total - 1);
			}
		},
	},
});
