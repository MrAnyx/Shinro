import { createLogger } from "evlog";

export default defineTask({
	meta: {
		name: "session:cleanup",
		description: "Delete expired sessions",
	},
	async run() {
		const log = createLogger({
			operation: "session:cleanup",
			task: true,
		});

		try {
			const { count } = await prisma.session.deleteMany({
				where: {
					expiresAt: { lt: new Date() },
				},
			});

			log.set({ deletedSessions: count });

			return { result: { deletedSessions: count } };
		} catch (err) {
			log.error(err instanceof Error ? err : new Error(String(err)));
			throw err;
		} finally {
			log.emit();
		}
	},
});
