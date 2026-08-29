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
						{{ greeting }} <span class="font-bold text-highlighted">{{ userStore.user?.username }}</span>
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
				<DataCard
					icon="i-lucide-tv-minimal-play"
					title="Series"
					subtitle="Binge or regret"
					:value="serieStore.total"
					to="/app/series"
				/>
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
					<UTable :columns="recentMediasColumns" :data="recentMedias" :loading="loadingRecent">
						<template #empty>
							<UEmpty
								title="No media found"
								description="Add you first media to see them here"
								variant="naked"
								icon="i-lucide-ban"
							></UEmpty>
						</template>
						<template #image-cell="{ row }">
							<ImageFallback
								:width="60"
								:height="90"
								class="rounded-sm"
								provider="tmdb"
								:src="row.original.imagePath"
							/>
						</template>
						<template #date-cell="{ row }">
							<NuxtTime
								:datetime="row.original.createdAt"
								year="numeric"
								month="short"
								day="numeric"
								hour="2-digit"
								minute="2-digit"
							/>
						</template>
						<template #status-cell="{ row }">
							<StatusBadge
								v-if="row.original.status"
								:type="row.original.type"
								:status="row.original.status"
							/>
						</template>
						<template #type-cell="{ row }">
							<UBadge variant="subtle" color="neutral">{{ capitalize(row.original.type) }}</UBadge>
						</template>
					</UTable>
				</UCard>
			</div>

			<template v-if="!loadingCollections">
				<div class="flex flex-col gap-y-3" v-for="collection in favoriteCollections">
					<div class="flex items-center gap-x-2">
						<UIcon name="i-lucide-folder" class="w-5 h-5" />
						<h2 class="text-xl">{{ collection.name }}</h2>
					</div>
					<UCard :ui="{ body: 'p-0!' }">
						<UTable :columns="favoriteCollectionColumns" :data="collection.medias">
							<template #empty>
								<UEmpty
									title="No media found"
									description="Add you first media in this collection to see them"
									variant="naked"
									icon="i-lucide-ban"
								></UEmpty>
							</template>
							<template #image-cell="{ row }">
								<ImageFallback
									:width="60"
									:height="90"
									class="rounded-sm"
									provider="tmdb"
									:src="row.original.media.imagePath"
								/>
							</template>
							<template #type-cell="{ row }">
								<UBadge variant="subtle" color="neutral" :label="capitalize(row.original.media.type)" />
							</template>
							<template #status-cell="{ row }">
								<StatusBadge
									v-if="row.original.media.status"
									:type="row.original.media.type"
									:status="row.original.media.status"
								/>
							</template>
							<template #createdAt-cell="{ row }">
								<NuxtTime
									:datetime="row.original.media.createdAt"
									year="numeric"
									month="short"
									day="numeric"
									hour="2-digit"
									minute="2-digit"
								/>
							</template>
							<template #addedAt-cell="{ row }">
								<NuxtTime
									:datetime="row.original.addedAt"
									year="numeric"
									month="short"
									day="numeric"
									hour="2-digit"
									minute="2-digit"
								/>
							</template>
						</UTable>
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
const userStore = useUserStore();
const collectionStore = useCollectionStore();
const movieStore = useMovieStore();
const serieStore = useSerieStore();
const trpc = useTrpc();

const recentMedias = computed(() => recentData.value?.results.slice(0, 5) ?? []);

const { data: recentData, pending: loadingRecent } = useSafeAsyncData(() =>
	trpc.media.getAll.query({ orderBy: [{ sort: "createdAt", order: "desc" }] }),
);

const { data: favoriteCollections, pending: loadingCollections } = useSafeAsyncData(() =>
	trpc.collection.getFavoritesWithMedias.query(),
);

const recentMediasColumns: TableColumn<MediaDefaultView>[] = [
	{
		id: "image",
		meta: {
			class: {
				td: "w-[60px]",
			},
		},
	},
	{
		header: "Name",
		accessorKey: "name",
		meta: {
			class: {
				td: "max-w-[120px] truncate font-bold",
			},
		},
	},
	{
		header: "Type",
		id: "type",
		meta: {
			class: {
				th: "w-0 whitespace-nowrap",
				td: "w-0 whitespace-nowrap",
			},
		},
	},
	{
		header: "Status",
		id: "status",
		meta: {
			class: {
				th: "w-0 whitespace-nowrap",
				td: "w-0 whitespace-nowrap",
			},
		},
	},
	{
		header: "Created At",
		id: "date",
		meta: {
			class: {
				th: "w-0 whitespace-nowrap",
				td: "w-0 whitespace-nowrap",
			},
		},
	},
];

const favoriteCollectionColumns: TableColumn<CollectionMediaWithMediaView>[] = [
	{
		id: "image",
		meta: {
			class: {
				td: "w-[60px]",
			},
		},
	},
	{
		header: "Name",
		accessorFn: (x) => x.media.name,
		meta: {
			class: {
				td: "max-w-[120px] truncate font-bold",
			},
		},
	},
	{
		header: "Type",
		id: "type",
		meta: {
			class: {
				th: "w-0 whitespace-nowrap",
				td: "w-0 whitespace-nowrap",
			},
		},
	},
	{
		header: "Status",
		id: "status",
		meta: {
			class: {
				th: "w-0 whitespace-nowrap",
				td: "w-0 whitespace-nowrap",
			},
		},
	},
	{
		header: "Created At",
		id: "createdAt",
		meta: {
			class: {
				th: "w-0 whitespace-nowrap",
				td: "w-0 whitespace-nowrap",
			},
		},
	},
	{
		header: "Added At",
		id: "addedAt",
		meta: {
			class: {
				th: "w-0 whitespace-nowrap",
				td: "w-0 whitespace-nowrap",
			},
		},
	},
];
</script>
