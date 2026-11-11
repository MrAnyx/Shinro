<template>
	<div class="flex justify-between">
		<SearchInput v-model="search" />
		<div class="flex gap-2">
			<RefreshButton @click="refresh()" />
			<UButton label="New season" leading-icon="i-lucide-plus" @click="openSeasonFormModal()" />
		</div>
	</div>
	<UCard :ui="{ body: 'p-0! h-full' }" class="h-full">
		<UTable
			:data="seasons"
			:columns="columns"
			:loading="pending"
			sticky
			class="h-full"
			@select="(_e, row) => navigateTo(`/app/series/internal/${row.original.serieId}/seasons/${row.original.id}`)"
		>
			<template #empty>
				<UEmpty title="No seasons found" variant="naked" icon="i-lucide-ban" />
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
			<template #rating-cell="{ row }">
				<VoteBadge :score="row.original.media.rating ?? undefined" />
			</template>
			<template #actions-cell="{ row }">
				<UDropdownMenu :content="{ align: 'end' }" :items="getRowActions(row.original)">
					<UButton
						variant="ghost"
						icon="i-lucide-ellipsis-vertical"
						color="neutral"
						aria-label="Season actions"
						@click.stop
					/>
				</UDropdownMenu>
			</template>
		</UTable>
	</UCard>
	<UPagination v-if="total > ITEMS_PER_PAGE" v-model:page="page" :total="total" :items-per-page="ITEMS_PER_PAGE" />
</template>

<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from "@nuxt/ui";
import { watchDebounced } from "@vueuse/core";

import { LazySeasonFormModal } from "#components";

const trpc = useTrpc();
const toast = useStatusToast();
const seasonStore = useSeasonStore();
const { openConfirmationModal } = useConfirmation();
const seasonFormModal = useOverlay().create(LazySeasonFormModal);
const { search, page, trimmedSearch } = useSearchPagination();

const columns: TableColumn<SeasonWithSerie>[] = [
	{ id: "image", meta: { class: { td: "w-[60px]" } } },
	{
		id: "title",
		header: "Title",
		cell: ({ row }) => row.original.media.name ?? `Season ${row.original.number}`,
		meta: { class: { td: "max-w-[120px] truncate font-bold text-default" } },
	},
	{
		id: "serie",
		header: "Series",
		cell: ({ row }) => row.original.serie.media.name,
		meta: { class: { td: "max-w-[120px] truncate" } },
	},
	{ accessorKey: "overview", header: "Overview", meta: { class: { td: "max-w-[300px] truncate" } } },
	{ id: "status", header: "Status", meta: { class: { th: "w-0 whitespace-nowrap", td: "w-0 whitespace-nowrap" } } },
	{
		id: "createdAt",
		header: "Created At",
		meta: { class: { th: "w-0 whitespace-nowrap", td: "w-0 whitespace-nowrap" } },
	},
	{ id: "rating", header: "Rating", meta: { class: { th: "w-0 whitespace-nowrap", td: "w-0 whitespace-nowrap" } } },
	{ id: "actions", meta: { class: { th: "w-0 whitespace-nowrap", td: "w-0 whitespace-nowrap" } } },
];

const { data, pending, refresh } = useClientAsyncData(
	() => trpc.season.getAll.query({ page: page.value, search: trimmedSearch.value }),
	{ watch: [page], defaultErrorMessage: "Failed to fetch seasons" },
);
const total = computed(() => data.value?.total ?? 0);
const seasons = computed(() => data.value?.results ?? []);
watchDebounced(trimmedSearch, () => refresh(), { debounce: DEBOUNCE_TIMER });

const openSeasonFormModal = (id?: string) =>
	toast.withErrorToast(async () => {
		const result = await seasonFormModal.open({ id }).result;
		if (result) {
			await refresh();
		}
	});

const getRowActions = (season: SeasonWithSerie): DropdownMenuItem[][] => [
	[
		{ label: "Edit", icon: "i-lucide-square-pen", onSelect: () => openSeasonFormModal(season.id) },
		{
			label: "Delete",
			icon: "i-lucide-trash",
			color: "error",
			async onSelect() {
				const result = await openConfirmationModal(() => seasonStore.deleteSeason({ id: season.id }), {
					title: "Delete this season",
					message: "This also deletes its saved episodes. Press confirm to proceed.",
					icon: "i-lucide-trash",
				});
				if (result) {
					if (seasons.value.length === 1 && page.value > 1) {
						page.value -= 1;
					} else {
						await refresh();
					}
				}
			},
		},
	],
];
</script>
