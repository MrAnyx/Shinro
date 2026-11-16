const bootstrapAdminSetup = async () => {
	if (await hasAdminUser()) {
		await deleteAdminSetupToken();
		return;
	}

	const token = await createAdminSetupToken();
	const minutes = Math.round(ADMIN_SETUP_TOKEN_TTL / 60);

	log.warn(
		"admin-setup",
		`No administrator account exists. Sign in with the account that should become administrator (register it first if needed), open Settings > Profile and enter this one-time setup token within ${minutes} minutes: ${token} . Restart the server to get a new token.`,
	);
};

export default defineNitroPlugin(() => {
	if (import.meta.prerender) {
		return;
	}

	// Not awaited so a slow database or Redis doesn't block startup
	bootstrapAdminSetup().catch((err: unknown) => {
		log.error(
			"admin-setup",
			`Unable to prepare the admin setup token: ${err instanceof Error ? err.message : String(err)}`,
		);
	});
});
