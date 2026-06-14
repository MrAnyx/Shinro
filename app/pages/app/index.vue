<template>
	<UDashboardPanel id="index">
		<template #header>
			<UDashboardNavbar title="Home">
				<template #leading>
					<UDashboardSidebarCollapse />
				</template>
			</UDashboardNavbar>
		</template>
		<template #body>
			<h1>Hello World</h1>
		</template>
	</UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
	layout: "app",
	middleware: ["auth"],
});

onMounted(async () => {
	const trpc = useTrpc();

	const result = await trpc.tmdb.movies.query();

	console.log(result);
});
</script>
