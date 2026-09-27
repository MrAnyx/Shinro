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
			@select="(_e, row) => onMovieSelected(row.original)"
		>
			<template #empty>
				<UEmpty
					title="No movie found"
					description="Add your first movie to get started"
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

import { LazyMovieFormModal } from "#components";

// Composables
const overlay = useOverlay();
const trpc = useTrpc();
const toast = useStatusToast();
const movieStore = useMovieStore();
const { openConfirmationModal } = useConfirmation();
const { search, page, trimmedSearch } = useSearchPagination();

// Table structure
const columns: TableColumn<MovieWithMediaView>[] = [
	{
		id: "image",
		meta: { class: { td: "w-[60px]" } },
	},
	{
		accessorFn: (x) => x.media.name,
		header: "Title",
		meta: { class: { td: "max-w-[120px] truncate font-bold text-default" } },
	},
	{
		accessorKey: "overview",
		header: "Overview",
		meta: { class: { td: "max-w-[300px] truncate" } },
	},
	{
		header: "Status",
		id: "status",
		meta: { class: { th: "w-0 whitespace-nowrap", td: "w-0 whitespace-nowrap" } },
	},
	{
		header: "Created At",
		id: "createdAt",
		meta: { class: { th: "w-0 whitespace-nowrap", td: "w-0 whitespace-nowrap" } },
	},
	{
		header: "Rating",
		id: "rating",
		meta: { class: { th: "w-0 whitespace-nowrap", td: "w-0 whitespace-nowrap" } },
	},
	{
		id: "actions",
		meta: { class: { th: "w-0 whitespace-nowrap", td: "w-0 whitespace-nowrap" } },
	},
];

// Get movies query
const total = computed(() => data.value?.total ?? 0);

const { data, pending, refresh } = useClientAsyncData(
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

// Methods
const movieFormModal = overlay.create(LazyMovieFormModal);
const openMovieFormModal = async (movieId?: string) =>
	toast.withErrorToast(async () => {
		const instance = movieFormModal.open({ id: movieId });

		const result = await instance.result;

		if (result?.movie) {
			// Refresh as it may change the order
			refresh();
		}
	});

const getRowActions = (movie: MovieWithMediaView): DropdownMenuItem[][] => [
	[
		{
			label: "Edit",
			icon: "i-lucide-square-pen",
			onSelect() {
				openMovieFormModal(movie.id);
			},
		},
		{
			label: "Delete",
			icon: "i-lucide-trash",
			color: "error",
			async onSelect() {
				const result = await openConfirmationModal(() => movieStore.deleteMovie({ id: movie.id }));

				if (result) {
					// Delete the selected element. No need to refresh here
					data.value.results = data.value.results.filter((m) => m.id !== movie.id);
				}
			},
		},
	],
];

const emptyActions: ButtonProps[] = [
	{
		icon: "i-lucide-search",
		label: "Search",
		async onClick() {
			await navigateTo({ path: "/app/movies/search" });
		},
	},
];

const onMovieSelected = async (movie: MovieWithMediaView) => {
	if (movie.media.externalId) {
		await navigateTo(`/app/movies/external/${movie.media.externalId}`);
	} else {
		await navigateTo(`/app/movies/internal/${movie.id}`);
	}
};
</script>
