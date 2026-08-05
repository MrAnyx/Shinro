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
			<UCard class="shrink-0">
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

			<div class="flex flex-col gap-y-3">
				<div class="flex items-center gap-x-2">
					<UIcon name="i-lucide-clock" class="w-5 h-5" />
					<h2 class="text-xl">Recently Added</h2>
				</div>
				<UCard :ui="{ body: 'p-0!' }">
					<UTable :columns="columns" />
				</UCard>
			</div>

			<template v-if="!pending">
				<div class="flex flex-col gap-y-3" v-for="collection in data">
					<div class="flex items-center gap-x-2">
						<UIcon name="i-lucide-folder" class="w-5 h-5" />
						<h2 class="text-xl">{{ collection.name }}</h2>
					</div>
					<UCard :ui="{ body: 'p-0!' }">
						<UTable :columns="columns" :data="collection?.collectionMovies" />
					</UCard>
				</div>
			</template>
		</template>
	</UDashboardPanel>
</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";

definePageMeta({
	layout: "app",
	middleware: ["auth"],
});

const { greeting } = useTimeGreeting();
const authStore = useAuthStore();
const collectionStore = useCollectionStore();
const movieStore = useMovieStore();
const trpc = useTrpc();

const { data, pending } = useAsyncData("favorite-collections", async () => {
	return await trpc.collections.getAllWithMedias.query({ favorite: true });
});

const columns: TableColumn<CollectionMovieWithMovieView>[] = [
	{
		header: "Title",
		accessorFn: (x) => x.movie.title,
	},
	{
		header: "Added At",
		accessorFn: (x) => x.addedAt,
	},
];
</script>
