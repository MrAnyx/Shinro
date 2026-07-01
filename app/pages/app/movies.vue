<template>
	<UDashboardPanel id="movies">
		<template #header>
			<UDashboardNavbar title="Movies">
				<template #leading>
					<UDashboardSidebarCollapse />
				</template>

				<template #right> </template>
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

const links: NavigationMenuItem[] = [
	{
		label: "My list",
		icon: "i-lucide-user-star",
		to: "/app/movies",
		exact: true,
	},
	{
		label: "Search",
		icon: "i-lucide-search",
		to: "/app/movies/search",
		exact: true,
	},
];
</script>
