<template>
	<UDashboardPanel id="index">
		<template #header>
			<UDashboardNavbar title="Overview">
				<template #leading>
					<UDashboardSidebarCollapse />
				</template>
			</UDashboardNavbar>
		</template>
		<template #body> </template>
	</UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
	layout: "app",
	middleware: ["auth"],
});

const authStore = useAuthStore();
</script>
