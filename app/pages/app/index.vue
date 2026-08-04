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
			<UCard>
				<div class="flex flex-col gap-y-3">
					<h2 class="text-2xl">
						{{ greeting }} <span class="font-bold text-highlighted">{{ authStore.user?.username }}</span>
					</h2>
					<p class="text-muted">
						Because remembering the plot of everything you've ever consumed is overrated. Just log it here
						and move on with your life.
					</p>
				</div>
			</UCard>

			<div class="grid grid-cols-3 gap-3">
				<DataCard
					icon="i-lucide-folder"
					title="Collections"
					subtitle="Hoarding, but organized"
					:value="collectionStore.total"
					to="/app/collections"
				/>
				<DataCard
					icon="i-lucide-clapperboard"
					title="Movies"
					subtitle="Watched (or not)"
					:value="movieStore.total"
					to="/app/movies"
				/>
				<DataCard icon="i-lucide-tv-minimal-play" title="Series" subtitle="Binge or regret" :value="0" />
				<DataCard icon="i-lucide-music" title="Musics" subtitle="Skipped after song 3" :value="0" />
				<DataCard icon="i-lucide-book-open" title="Books" subtitle="Read (or lied about)" :value="0" />
				<DataCard icon="i-lucide-gamepad-2" title="Games" subtitle="Backlog forever" :value="0" />
			</div>
		</template>
	</UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
	layout: "app",
	middleware: ["auth"],
});

const { greeting } = useTimeGreeting();
const authStore = useAuthStore();
const collectionStore = useCollectionStore();
const movieStore = useMovieStore();
</script>
