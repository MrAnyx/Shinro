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
				></UEmpty>
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
				<VoteBadge :average="row.original.vote_average" :count="row.original.vote_count" />
			</template>
			<template #actions-cell="{ row }">
				<UButton
					v-if="!row.original.internalId"
					variant="ghost"
					icon="i-lucide-circle-plus"
					color="neutral"
					@click="addMovieToMyList(row)"
					:loading="loadingMovieIds.has(row.original.id)"
					:disabled="loadingMovieIds.has(row.original.id)"
				/>
				<UButton
					v-else
					variant="ghost"
					icon="i-lucide-circle-minus"
					color="error"
					@click="removeMovieFromMyList(row)"
					:loading="loadingMovieIds.has(row.original.id)"
					:disabled="loadingMovieIds.has(row.original.id)"
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

const loadingMovieIds = reactive(new Set<string>());

onMounted(() => {
	focusSearchField();
});

const { data, pending, refresh, clear } = useSafeAsyncData(
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
				td: "max-w-[120px] truncate font-bold",
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
		accessorKey: "adult",
		header: "Category",
		meta: {
			class: {
				th: "w-0 whitespace-nowrap",
				td: "w-0 whitespace-nowrap",
			},
		},
	},
	{
		accessorKey: "release_date",
		header: "Released At",
		meta: {
			class: {
				th: "w-0 whitespace-nowrap",
				td: "w-0 whitespace-nowrap",
			},
		},
	},
	{
		accessorKey: "vote_average",
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

const resetSearchField = () => {
	search.value = "";
};

const addMovieToMyList = async (row: TableRow<TmdbMovieSearchDefaultView>) => {
	try {
		loadingMovieIds.add(row.original.id);

		const movie = await movieStore.createMovieFromExternal({ externalId: row.original.id });

		if (!data.value) {
			return;
		}

		data.value = {
			...data.value,
			results: data.value.results.map((m) =>
				m.id === row.original.id ? Object.assign(m, { internalId: movie.id }) : m,
			),
		};

		toast.success({ description: `${movie.media.name} has been added to your list` });
	} catch (err: any) {
		toast.error(err);
	} finally {
		loadingMovieIds.delete(row.original.id);
	}
};

const removeMovieFromMyList = async (row: TableRow<TmdbMovieSearchDefaultView>) => {
	try {
		loadingMovieIds.add(row.original.id);

		if (!row.original.internalId) {
			return;
		}

		await movieStore.deleteMovie({ id: row.original.internalId });

		if (!data.value) {
			return;
		}

		data.value = {
			...data.value,
			results: data.value.results.map((m) =>
				m.id === row.original.id ? Object.assign(m, { internalId: undefined }) : m,
			),
		};

		toast.success({ description: `${row.original.title} has been removed from your list` });
	} catch (err: any) {
		toast.error(err);
	} finally {
		loadingMovieIds.delete(row.original.id);
	}
};

const onMovieSelected = async (e: Event, row: TableRow<TmdbMovieSearchDefaultView>) => {
	await navigateTo({ path: `/app/movies/external/${row.original.id}` });
};
</script>
