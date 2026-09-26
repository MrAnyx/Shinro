export const useSerieStore = defineStore("season", {
	state: () => ({
		total: 0,
	}),
	getters: {},
	actions: {
		async initialize() {
			const trpc = useTrpc();
			const [count] = await Promise.all([trpc.season.count.query()]);
			this.total = count;
		},

		async createSerie(payload: TRPCProcedureInput<"season", "create">) {
			const trpc = useTrpc();

			const season = await trpc.season.create.mutate(payload);
			this.total += 1;

			return season;
		},

		async createSerieFromExternal(payload: TRPCProcedureInput<"season", "createFromExternal">) {
			const trpc = useTrpc();

			const season = await trpc.season.createFromExternal.mutate(payload);
			this.total += 1;

			return season;
		},

		async deleteSerie(payload: TRPCProcedureInput<"season", "delete">) {
			const trpc = useTrpc();

			await trpc.season.delete.mutate(payload);
			this.total -= 1;
		},
	},
});
