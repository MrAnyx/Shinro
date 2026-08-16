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

		// async createMovie(payload: TRPCProcedureInput<"movie", "create">) {
		// 	const trpc = useTrpc();
		// 	const movie = await trpc.movie.create.mutate(payload);
		// 	this.total += 1;
		// 	return movie;
		// },

		// async createMovieFromExternal(payload: TRPCProcedureInput<"movie", "createFromExternal">) {
		// 	const trpc = useTrpc();
		// 	const movie = await trpc.movie.createFromExternal.mutate(payload);
		// 	this.total += 1;
		// 	return movie;
		// },

		// async deleteMovie(payload: TRPCProcedureInput<"movie", "delete">) {
		// 	const trpc = useTrpc();
		// 	await trpc.movie.delete.mutate(payload);
		// 	this.total -= 1;
		// },
	},
});
