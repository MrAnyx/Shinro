<template>
	<UDashboardPanel id="seasons">
		<template #header>
			<UDashboardNavbar title="Seasons">
				<template #leading>
					<UDashboardSidebarCollapse />
				</template>
			</UDashboardNavbar>
		</template>

		<template #body>
			<NuxtPage />
		</template>
	</UDashboardPanel>
</template>
<script setup lang="ts">
definePageMeta({
	layout: "app",
	middleware: ["auth", "series"],
});
</script>
