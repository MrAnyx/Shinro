<template>
	<div class="flex justify-between">
		<SearchInput v-model="search" />

		<div class="flex gap-2">
			<RefreshButton @click="refresh()" />
			<UButton label="New movie" leading-icon="i-lucide-plus" @click="openMovieFormModal()" />
		</div>
	</div>
	<UCard :ui="{ body: 'p-0! h-full' }" class="h-full">
		<UTable
			:data="data?.results"
			:columns="columns"
			:loading="pending"
			sticky
			class="h-full"
			@select="onMovieSelected"
		>
			<template #empty>
				<UEmpty
					title="No movie found"
					description="Add your first movie to get started"
					variant="naked"
					icon="i-lucide-ban"
					:actions="emptyActions"
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
			<template #actions-cell="{ row }">
				<UDropdownMenu :content="{ align: 'end' }" :items="getRowActions(row)">
					<UButton variant="ghost" icon="i-lucide-ellipsis-vertical" color="neutral" />
				</UDropdownMenu>
			</template>
		</UTable>
	</UCard>
	<UPagination
		v-model:page="page"
		:total="data?.total"
		:items-per-page="ITEMS_PER_PAGE"
		v-show="(data?.total ?? 0) > ITEMS_PER_PAGE"
	/>
</template>
<script setup lang="ts">
import type { TableColumn, ButtonProps, TableRow, DropdownMenuItem } from "@nuxt/ui";
import { watchDebounced } from "@vueuse/core";

import { LazyMovieFormModal } from "#components";

const overlay = useOverlay();
const trpc = useTrpc();
const movieStore = useMovieStore();
const { openConfirmationModal } = useConfirmation();
const { search, page, trimmedSearch } = useSearchPagination();

const movieFormModal = overlay.create(LazyMovieFormModal);
const openMovieFormModal = async (movie?: MovieWithMediaView) => {
	const instance = movieFormModal.open({ id: movie?.id });

	const result = await instance.result;

	if (result) {
		refresh();
	}
};

const { data, pending, refresh } = useSafeAsyncData(
	() =>
		trpc.movie.getAll.query({
			page: page.value,
			search: trimmedSearch.value,
			orderBy: [
				{ sort: "media.name", order: "asc" },
				{ sort: "media.createdAt", order: "asc" },
			],
		}),
	{
		watch: [page],
		defaultErrorMessage: "Failed to fetch movies",
	},
);

watchDebounced(trimmedSearch, () => refresh(), {
	debounce: DEBOUNCE_TIMER,
});

const columns: TableColumn<MovieWithMediaView>[] = [
	{
		id: "image",
		meta: {
			class: {
				td: "w-[60px]",
			},
		},
	},
	{
		accessorFn: (x) => x.media.name,
		header: "Title",
		meta: {
			class: {
				td: "max-w-[120px] truncate font-bold text-default",
			},
		},
	},
	{
		accessorKey: "overview",
		header: "Overview",
		meta: {
			class: {
				td: "max-w-[300px] truncate",
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
		id: "actions",
		meta: {
			class: {
				th: "w-0 whitespace-nowrap",
				td: "w-0 whitespace-nowrap",
			},
		},
	},
];

const getRowActions = (row: TableRow<MovieWithMediaView>): DropdownMenuItem[][] => [
	[
		{
			label: "Edit",
			icon: "i-lucide-square-pen",
			onSelect() {
				openMovieFormModal(row.original);
			},
		},
		{
			label: "Delete",
			icon: "i-lucide-trash",
			color: "error",
			async onSelect() {
				const result = await openConfirmationModal(
					async () => await movieStore.deleteMovie({ id: row.original.id }),
				);

				if (result) {
					refresh();
				}
			},
		},
	],
];

const resetSearchField = () => {
	search.value = "";
};

const emptyActions: ButtonProps[] = [
	{
		icon: "i-lucide-search",
		label: "Search",
		async onClick() {
			await navigateTo({
				path: "/app/movies/search",
			});
		},
	},
];

const onMovieSelected = async (e: Event, row: TableRow<MovieWithMediaView>) => {
	if (row.original.media.externalId) {
		await navigateTo(`/app/movies/external/${row.original.media.externalId}`);
	} else {
		await navigateTo(`/app/movies/internal/${row.original.id}`);
	}
};
</script>
