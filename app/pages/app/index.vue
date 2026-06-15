<template>
	<UDashboardPanel id="index">
		<template #header>
			<UDashboardNavbar title="Overview">
				<template #leading>
					<UDashboardSidebarCollapse />
				</template>
			</UDashboardNavbar>
		</template>
		<template #body>
			<UCard variant="outline">
				<div class="flex flex-col gap-y-3">
					<h2 class="text-2xl text-highlighted">Welcome back {{ authStore.user?.username }}</h2>
					<p class="text-muted">
						Because remembering the plot of everything you've ever consumed is overrated. Just log it here and move on with your life.
					</p>
				</div>
			</UCard>

			<div class="grid grid-cols-6">
				<USkeleton class="w-full h-[350px] rounded-2xl" v-for="i in 3"></USkeleton>
			</div>
		</template>
	</UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
	layout: "app",
	middleware: ["auth"],
});

const authStore = useAuthStore();
</script>
