<template>
	<UDashboardPanel id="series">
		<template #header>
			<UDashboardNavbar title="Series">
				<template #leading>
					<UDashboardSidebarCollapse />
				</template>
			</UDashboardNavbar>

			<UDashboardToolbar>
				<!-- NOTE: The `-mx-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
				<UNavigationMenu :items="links" highlight class="-mx-1" />
			</UDashboardToolbar>
		</template>

		<template #body>
			<NuxtPage />
		</template>
	</UDashboardPanel>
</template>
<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

definePageMeta({
	layout: "app",
	middleware: ["auth"],
});

const movieStore = useMovieStore();

const links = computed<NavigationMenuItem[]>(() => [
	{
		label: "My list",
		icon: "i-lucide-user-star",
		to: "/app/series",
		exact: true,
		badge: movieStore.total,
	},
	{
		label: "Search",
		icon: "i-lucide-search",
		to: "/app/series/search",
		exact: true,
	},
]);
</script>
