export const useSeasonStore = defineStore("season", {
	state: () => ({
		total: 0,
	}),
	actions: {
		async initialize() {
			const trpc = useTrpc();
			this.total = await trpc.season.count.query();
		},
		async createSeasonFromExternal(payload: TRPCProcedureInput<"season", "createFromExternal">) {
			const trpc = useTrpc();
			const result = await trpc.season.createFromExternal.mutate(payload);
			this.total += 1;
			if (result.createdSerie) {
				const serieStore = useSerieStore();
				serieStore.total += 1;
			}
			return result;
		},
		async deleteSeason(payload: TRPCProcedureInput<"season", "delete">) {
			const trpc = useTrpc();
			await trpc.season.delete.mutate(payload);
			this.total -= 1;
		},
	},
});
