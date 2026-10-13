export const useMovieStore = defineStore("movie", {
	state: () => ({
		total: 0,
	}),
	getters: {},
	actions: {
		async initialize() {
			const trpc = useTrpc();

			const [count] = await Promise.all([trpc.movie.count.query()]);

			this.total = count;
		},

		async createMovieFromInternal(payload: TRPCProcedureInput<"movie", "createFromInternal">) {
			const trpc = useTrpc();
			const movie = await trpc.movie.createFromInternal.mutate(payload);
			this.total += 1;
			return movie;
		},

		async createMovieFromExternal(payload: TRPCProcedureInput<"movie", "createFromExternal">) {
			const trpc = useTrpc();
			const movie = await trpc.movie.createFromExternal.mutate(payload);
			this.total += 1;
			return movie;
		},

		async deleteMovie(payload: TRPCProcedureInput<"movie", "delete">) {
			const trpc = useTrpc();
			await trpc.movie.delete.mutate(payload);
			this.total -= 1;
		},
	},
});
