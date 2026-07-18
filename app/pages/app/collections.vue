<template>
	<UDashboardPanel id="collections">
		<template #header>
			<UDashboardNavbar title="Collections">
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
	middleware: ["auth"],
});
</script>
