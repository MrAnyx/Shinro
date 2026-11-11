<template>
	<div class="flex justify-end"><RefreshButton @click="refresh()" /></div>
	<UAlert v-if="error" color="error" title="Failed to fetch episodes">
		<template #actions><UButton label="Retry" color="error" variant="subtle" @click="refresh()" /></template>
	</UAlert>
	<UCard v-else :ui="{ body: 'p-0! h-full' }" class="h-full">
		<UTable
			:data="episodes"
			:columns="columns"
			:loading="pending"
			sticky
			class="h-full"
			@select="(_event, row) => navigateTo(episodeUrl(row.original))"
		>
			<template #empty><UEmpty title="No episodes found" variant="naked" icon="i-lucide-ban" /></template>
			<template #image-cell="{ row }">
				<ImageFallback
					:width="100"
					:height="56"
					class="rounded-sm"
					provider="tmdb"
					:src="row.original.media.imagePath"
				/>
			</template>
			<template #status-cell="{ row }">
				<StatusBadge
					v-if="row.original.media.status"
					:type="row.original.media.type"
					:status="row.original.media.status"
				/>
			</template>
			<template #rating-cell="{ row }"><VoteBadge :score="row.original.media.rating ?? undefined" /></template>
		</UTable>
	</UCard>
	<UPagination v-if="total > ITEMS_PER_PAGE" v-model:page="page" :total="total" :items-per-page="ITEMS_PER_PAGE" />
</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";

import { SourceType } from "#prisma/enums";

const trpc = useTrpc();
const page = ref(1);
const { data, pending, error, refresh } = useClientAsyncData(() => trpc.episode.getAll.query({ page: page.value }), {
	watch: [page],
	defaultErrorMessage: "Failed to fetch episodes",
});
const episodes = computed(() => data.value?.results ?? []);
const total = computed(() => data.value?.total ?? 0);
const columns: TableColumn<EpisodeWithParents>[] = [
	{ id: "image", meta: { class: { td: "w-[100px]" } } },
	{ id: "title", header: "Title", cell: ({ row }) => row.original.media.name ?? `Episode ${row.original.number}` },
	{
		id: "season",
		header: "Season",
		cell: ({ row }) => row.original.season.media.name ?? `Season ${row.original.season.number}`,
	},
	{ id: "serie", header: "Series", cell: ({ row }) => row.original.season.serie.media.name },
	{ id: "status", header: "Status" },
	{ id: "rating", header: "Rating" },
];
const episodeUrl = (episode: EpisodeWithParents) =>
	episodeDetailsPath(
		episode.media.source === SourceType.EXTERNAL && episode.season.serie.media.externalId
			? episode.season.serie.media.externalId
			: episode.season.serieId,
		episode.season.number,
		episode.number,
	);
</script>
