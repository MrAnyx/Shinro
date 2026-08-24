export const useBookStore = defineStore("book", {
	state: () => ({
		total: 0,
	}),
	getters: {},
	actions: {
		async initialize() {
			const trpc = useTrpc();

			const [count] = await Promise.all([trpc.book.count.query()]);

			this.total = count;
		},

		async createBook(payload: TRPCProcedureInput<"book", "create">) {
			const trpc = useTrpc();
			const book = await trpc.book.create.mutate(payload);
			this.total += 1;
			return book;
		},

		async createBookFromExternal(payload: TRPCProcedureInput<"book", "createFromExternal">) {
			const trpc = useTrpc();
			const book = await trpc.book.createFromExternal.mutate(payload);
			this.total += 1;
			return book;
		},

		async deleteBook(payload: TRPCProcedureInput<"book", "delete">) {
			const trpc = useTrpc();
			await trpc.book.delete.mutate(payload);
			this.total -= 1;
		},
	},
});
