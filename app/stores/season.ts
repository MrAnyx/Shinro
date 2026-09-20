export const useSeasonStore = defineStore("season", {
	actions: {
		async createSeasonFromExternal(payload: TRPCProcedureInput<"season", "createFromExternal">) {
			return useTrpc().season.createFromExternal.mutate(payload);
		},

		async deleteSeason(payload: TRPCProcedureInput<"season", "delete">) {
			await useTrpc().season.delete.mutate(payload);
		},
	},
});
