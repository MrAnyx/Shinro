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

const userStore = useUserStore();

const links = computed<NavigationMenuItem[]>(() => [
	{
		label: "Profile",
		icon: "i-lucide-user",
		to: "/app/settings/profile",
		exact: true,
	},
	{
		label: "Security",
		icon: "i-lucide-shield",
		to: "/app/settings/security",
		exact: true,
	},
	{
		label: "Appearance",
		icon: "i-lucide-palette",
		to: "/app/settings/appearance",
		exact: true,
	},
	...(userStore.isAdmin
		? [{ label: "Administration", icon: "i-lucide-shield-check", to: "/app/settings/administration", exact: true }]
		: []),
]);
</script>
