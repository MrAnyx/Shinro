export const useMovieStore = defineStore("movie", {
	state: () => ({
		total: 0,
	}),
	getters: {},
	actions: {
		async initialize() {
			const trpc = useTrpc();

			const [count] = await Promise.all([trpc.movies.count.query()]);

			this.total = count;
		},

		async createMovie(payload: { title: string; description?: string }) {
			const trpc = useTrpc();
			const movie = await trpc.movies.create.mutate(payload);
			this.total += 1;
			return movie;
		},

		async createMovieFromExternal(payload: { externalId: string }) {
			const trpc = useTrpc();
			const movie = await trpc.movies.createFromExternal.mutate(payload);
			this.total += 1;
			return movie;
		},

		async deleteMovie(id: string) {
			const trpc = useTrpc();
			await trpc.movies.delete.mutate({ id });
			this.total -= 1;
		},

		async updateMovie(id: string, payload: { title: string; description?: string }) {
			const trpc = useTrpc();
			const movie = await trpc.movies.update.mutate({
				id,
				...payload,
			});
			return movie;
		},
	},
});
