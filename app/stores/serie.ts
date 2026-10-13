export const useSerieStore = defineStore("serie", {
	state: () => ({
		total: 0,
	}),
	getters: {},
	actions: {
		async initialize() {
			const trpc = useTrpc();
			const [count] = await Promise.all([trpc.serie.count.query()]);
			this.total = count;
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
		},
	},
});
