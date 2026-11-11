export const useSerieStore = defineStore("serie", {
	state: () => ({
		total: 0,
	}),
	actions: {
		async initialize() {
			const trpc = useTrpc();
			this.total = await trpc.serie.count.query();
		},
		async createSerieFromInternal(payload: TRPCProcedureInput<"serie", "createFromInternal">) {
			const trpc = useTrpc();
			const serie = await trpc.serie.createFromInternal.mutate(payload);
			this.total += 1;
			return serie;
		},
		async createSerieFromExternal(payload: TRPCProcedureInput<"serie", "createFromExternal">) {
			const trpc = useTrpc();
			const serie = await trpc.serie.createFromExternal.mutate(payload);
			this.total += 1;
			return serie;
		},
		async deleteSerie(payload: TRPCProcedureInput<"serie", "delete">) {
			const trpc = useTrpc();
			await trpc.serie.delete.mutate(payload);
			this.total -= 1;
			const episodeStore = useEpisodeStore();
			episodeStore.invalidate();
			try {
				const seasonStore = useSeasonStore();
				await seasonStore.initialize();
			} catch (error) {
				const statusToast = useStatusToast();
				statusToast.error(error, {
					description: "Series deleted, but the season count could not be refreshed. Reload to try again.",
				});
			}
			try {
				await episodeStore.initialize();
			} catch (error) {
				const statusToast = useStatusToast();
				statusToast.error(error, {
					description: "Series deleted, but the episode count could not be refreshed. Reload to try again.",
				});
			}
		},
	},
});
