export const useSeasonStore = defineStore("season", {
	state: () => ({
		total: 0,
	}),
	actions: {
		async initialize() {
			this.total = await useTrpc().season.count.query();
		},
		async createSeasonFromExternal(payload: TRPCProcedureInput<"season", "createFromExternal">) {
			const result = await useTrpc().season.createFromExternal.mutate(payload);
			this.total += 1;
			if (result.createdSerie) {
				useSerieStore().total += 1;
			}
			return result;
		},
		async deleteSeason(payload: TRPCProcedureInput<"season", "delete">) {
			await useTrpc().season.delete.mutate(payload);
			this.total -= 1;
		},
	},
});
