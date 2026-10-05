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
			@select="(_e, row) => onSeasonSelected(row.original)"
		>
			<template #empty>
				<UEmpty
					title="No season found"
					description="Add your first season to get started"
					variant="naked"
					icon="i-lucide-ban"
					:actions="emptyActions"
				/>
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
					<UButton variant="ghost" icon="i-lucide-ellipsis-vertical" color="neutral" />
				</UDropdownMenu>
			</template>
		</UTable>
	</UCard>
	<UPagination v-model:page="page" :total="total" :items-per-page="ITEMS_PER_PAGE" v-if="total > ITEMS_PER_PAGE" />
</template>
<script setup lang="ts">
import type { TableColumn, ButtonProps, DropdownMenuItem } from "@nuxt/ui";
import { watchDebounced } from "@vueuse/core";

// import { LazySeasonFormModal } from "#components";

// Composable
const overlay = useOverlay();
const trpc = useTrpc();
const seasonStore = useSeasonStore();
const { openConfirmationModal } = useConfirmation();
const { search, page, trimmedSearch } = useSearchPagination();
// const seasonFormModal = overlay.create(LazySeasonFormModal);

const columns: TableColumn<SeasonWithMedia>[] = [
	{
		id: "image",
		meta: { class: { td: "w-[60px]" } },
	},
	{
		id: "title",
		header: "Title",
		cell: ({ row }) => row.original.media.name,
		meta: { class: { td: "max-w-[120px] truncate font-bold text-default" } },
	},
	{
		accessorKey: "overview",
		header: "Overview",
		meta: { class: { td: "max-w-[300px] truncate" } },
	},
	{
		id: "status",
		header: "Status",
		meta: { class: { th: "w-0 whitespace-nowrap", td: "w-0 whitespace-nowrap" } },
	},
	{
		id: "createdAt",
		header: "Created At",
		meta: { class: { th: "w-0 whitespace-nowrap", td: "w-0 whitespace-nowrap" } },
	},
	{
		id: "rating",
		header: "Rating",
		meta: { class: { th: "w-0 whitespace-nowrap", td: "w-0 whitespace-nowrap" } },
	},
	{
		id: "actions",
		meta: { class: { th: "w-0 whitespace-nowrap", td: "w-0 whitespace-nowrap" } },
	},
];

const emptyActions: ButtonProps[] = [
	{
		icon: "i-lucide-search",
		label: "Search",
		async onClick() {
			await navigateTo({ path: "/app/series/search" });
		},
	},
];

// Get series query
const total = computed(() => data.value?.total ?? 0);
const seasons = computed(() => data.value?.results ?? []);

const { data, pending, refresh } = useClientAsyncData(
	() =>
		trpc.season.getAll.query({
			page: page.value,
			search: trimmedSearch.value,
			orderBy: [
				{ sort: "media.name", order: "asc" },
				{ sort: "media.createdAt", order: "asc" },
			],
		}),
	{
		watch: [page],
		defaultErrorMessage: "Failed to fetch series",
	},
);

watchDebounced(trimmedSearch, () => refresh(), {
	debounce: DEBOUNCE_TIMER,
});

// Methods
const openSeasonFormModal = async (seasonId?: string) => {
	// const instance = seasonFormModal.open({ id: seasonId });
	// const result = await instance.result;
	// if (result?.season) {
	// 	refresh();
	// }
};

const getRowActions = (season: SeasonWithMedia): DropdownMenuItem[][] => [
	[
		{
			label: "Edit",
			icon: "i-lucide-square-pen",
			onSelect() {
				openSeasonFormModal(season.id);
			},
		},
		{
			label: "Delete",
			icon: "i-lucide-trash",
			color: "error",
			async onSelect() {
				// const result = await openConfirmationModal(() => seasonStore.deleteSeason({ id: season.id }));
				// if (result) {
				// 	// Delete the selected element. No need to refresh here
				// 	data.value.results = data.value.results.filter((m) => m.id !== season.id);
				// }
			},
		},
	],
];

const onSeasonSelected = async (season: SeasonWithMedia) => {
	// if (season.media.externalId) {
	// 	await navigateTo(`/app/seasons/external/${season.media.externalId}`);
	// } else {
	// 	await navigateTo(`/app/seasons/internal/${season.id}`);
	// }
};
</script>
