<template>
	<div class="flex justify-between">
		<SearchInput v-model="search" ref="searchInput" />
		<RefreshButton @click="refresh()" />
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
					description="No movie exist with this title"
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
					:src="row.original.poster_path"
				/>
			</template>
			<template #adult-cell="{ row }">
				<AdultBadge :adult="row.original.adult" />
			</template>
			<template #release_date-cell="{ row }">
				<NuxtTime
					v-if="row.original.release_date"
					:datetime="row.original.release_date"
					year="numeric"
					month="short"
					day="numeric"
					timezone="UTC"
				/>
			</template>
			<template #vote_average-cell="{ row }">
				<VoteBadge :score="row.original.vote_average" :count="row.original.vote_count" />
			</template>
			<template #actions-cell="{ row }">
				<ToggleButton
					variant="ghost"
					:is-added="!!row.original.internalId"
					:on-add="() => addMovieToMyList(row)"
					:on-remove="() => removeMovieFromMyList(row)"
				/>
			</template>
		</UTable>
	</UCard>
	<UPagination
		v-model:page="page"
		:total="data?.total"
		:items-per-page="TMDB_ITEMS_PER_PAGE"
		v-show="(data?.total ?? 0) > TMDB_ITEMS_PER_PAGE"
	/>
</template>

<script setup lang="ts">
import type { TableColumn, ButtonProps, TableRow } from "@nuxt/ui";
import { watchDebounced } from "@vueuse/core";

const trpc = useTrpc();
const movieStore = useMovieStore();
const toast = useStatusToast();
const { search, page, trimmedSearch } = useSearchPagination();

const searchInput = useTemplateRef("searchInput");

onMounted(() => {
	focusSearchField();
});

const { data, pending, refresh, clear } = useClientAsyncData(
	() => trpc.tmdbMovie.search.query({ page: page.value, search: trimmedSearch.value }),
	{
		enabled: () => !!trimmedSearch.value,
		watch: [page],
	},
);

watchDebounced(
	trimmedSearch,
	() => {
		if (!trimmedSearch.value) {
			clear();
		} else {
			refresh();
		}
	},
	{
		debounce: DEBOUNCE_TIMER,
	},
);

const columns: TableColumn<TmdbMovieSearchDefaultView>[] = [
	{
		id: "image",
		meta: {
			class: {
				td: "w-[60px]",
			},
		},
	},
	{
		accessorKey: "title",
		header: "Title",
		meta: {
			class: {
				td: "max-w-[120px] truncate font-bold text-default",
			},
		},
	},
	{
		accessorKey: "overview",
		header: "Synopsis",
		meta: {
			class: {
				td: "max-w-[300px] truncate",
			},
		},
	},
	{
		id: "adult",
		header: "Category",
		meta: {
			class: {
				th: "w-0 whitespace-nowrap",
				td: "w-0 whitespace-nowrap",
			},
		},
	},
	{
		id: "release_date",
		header: "Released At",
		meta: {
			class: {
				th: "w-0 whitespace-nowrap",
				td: "w-0 whitespace-nowrap",
			},
		},
	},
	{
		id: "vote_average",
		header: "Vote",
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

const emptyActions: ButtonProps[] = [
	{
		icon: "i-lucide-search",
		label: "Search",
		onClick() {
			focusSearchField();
		},
	},
];

const focusSearchField = () => {
	searchInput.value?.inputRef?.select();
	searchInput.value?.inputRef?.focus();
};

const updateMovieInternalId = (externalId: string, internalId?: string) => {
	const target = data.value?.results.find((m) => m.id === externalId);
	if (target) {
		target.internalId = internalId;
	}
};

const addMovieToMyList = async (row: TableRow<TmdbMovieSearchDefaultView>) => {
	try {
		const movie = await movieStore.createMovieFromExternal({ externalId: row.original.id });

		updateMovieInternalId(row.original.id, movie.id);

		toast.success({ description: `${movie.media.name} has been added to your list` });
	} catch (err: any) {
		toast.error(err);
	}
};

const removeMovieFromMyList = async (row: TableRow<TmdbMovieSearchDefaultView>) => {
	try {
		if (!row.original.internalId) {
			return;
		}

		await movieStore.deleteMovie({ id: row.original.internalId });

		updateMovieInternalId(row.original.id, undefined);

		toast.success({ description: `${row.original.title} has been removed from your list` });
	} catch (err: any) {
		toast.error(err);
	}
};

const onMovieSelected = async (e: Event, row: TableRow<TmdbMovieSearchDefaultView>) => {
	await navigateTo({ path: `/app/movies/external/${row.original.id}` });
};
</script>
