<template>
	<UDashboardPanel id="settings">
		<template #header>
			<UDashboardNavbar title="Settings">
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

const links = computed<NavigationMenuItem[]>(() => [
	{
		label: "Profile",
		icon: "i-lucide-user",
		to: "/app/settings/profile",
		exact: true,
	},
]);
</script>
