<template>
	<UDashboardPanel id="movies">
		<template #header>
			<UDashboardNavbar title="Movies">
				<template #leading>
					<UDashboardSidebarCollapse />
				</template>

				<template #right> </template>
			</UDashboardNavbar>

			<UDashboardToolbar :ui="{ root: 'p-0! border-0' }">
				<UTabs color="neutral" variant="link" :content="false" :items="items" class="w-full" />
			</UDashboardToolbar>
		</template>

		<template #body> </template>
	</UDashboardPanel>
</template>
<script setup lang="ts">
definePageMeta({
	layout: "app",
	middleware: ["auth"],
});

import type { TabsItem } from "@nuxt/ui";

const items = ref<TabsItem[]>([
	{
		label: "Account",
	},
	{
		label: "Password",
	},
]);
</script>
