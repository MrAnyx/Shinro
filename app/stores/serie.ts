export const useSerieStore = defineStore("serie", {
	state: () => ({
		total: 0,
	}),
	actions: {
		async initialize() {
			this.total = await useTrpc().serie.count.query();
		},
		async createSerieFromInternal(payload: TRPCProcedureInput<"serie", "createFromInternal">) {
			const serie = await useTrpc().serie.createFromInternal.mutate(payload);
			this.total += 1;
			return serie;
		},
		async createSerieFromExternal(payload: TRPCProcedureInput<"serie", "createFromExternal">) {
			const serie = await useTrpc().serie.createFromExternal.mutate(payload);
			this.total += 1;
			return serie;
		},
		async deleteSerie(payload: TRPCProcedureInput<"serie", "delete">) {
			await useTrpc().serie.delete.mutate(payload);
			this.total -= 1;
		},
	},
});
