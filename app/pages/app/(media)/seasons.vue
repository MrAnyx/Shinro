<template>
	<UDashboardPanel id="seasons">
		<template #header>
			<UDashboardNavbar title="Seasons">
				<template #leading>
					<UDashboardSidebarCollapse />
				</template>
			</UDashboardNavbar>
			<UDashboardToolbar>
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

definePageMeta({ layout: "app", middleware: ["auth", "series"] });

const seasonStore = useSeasonStore();
const links = computed<NavigationMenuItem[]>(() => [
	{ label: "My list", icon: "i-lucide-user-star", to: "/app/seasons", exact: true, badge: seasonStore.total },
]);
</script>
