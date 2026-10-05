<template>
	<div class="flex justify-between">
		<SearchInput v-model="search" ref="searchInput" />
		<RefreshButton @click="refresh()" />
	</div>
	<UCard :ui="{ body: 'p-0! h-full' }" class="h-full">
		<UTable
			:data="series"
			:columns="columns"
			:loading="pending"
			sticky
			class="h-full"
			@select="(_e, row) => onMovieSelected(row.original)"
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
			<template #date-cell="{ row }">
				<NuxtTime
					v-if="row.original.release_date"
					:datetime="row.original.release_date"
					year="numeric"
					month="short"
					day="numeric"
					timezone="UTC"
				/>
			</template>
			<template #vote-cell="{ row }">
				<VoteBadge :score="row.original.vote_average" :count="row.original.vote_count" />
			</template>
			<template #actions-cell="{ row }">
				<ToggleButton
					variant="ghost"
					:is-added="!!row.original.internal_movie"
					:onClickOn="() => addMovieToMyList(row.original)"
					:onClickOff="() => removeMovieFromMyList(row.original)"
				/>
			</template>
		</UTable>
	</UCard>
	<UPagination
		v-model:page="page"
		:total="total"
		:items-per-page="TMDB_ITEMS_PER_PAGE"
		v-if="total > TMDB_ITEMS_PER_PAGE"
	/>
</template>

<script setup lang="ts">
import type { TableColumn, ButtonProps } from "@nuxt/ui";
import { watchDebounced } from "@vueuse/core";

// Composables
const trpc = useTrpc();
const movieStore = useMovieStore();
const toast = useStatusToast();
const { search, page, trimmedSearch } = useSearchPagination();
const searchInput = useTemplateRef("searchInput");

// Lifecycle hooks
onMounted(() => {
	_focusSearchField();
});

// Table structure
const columns: TableColumn<TmdbMovieSearch>[] = [
	{
		id: "image",
		meta: { class: { td: "w-[60px]" } },
	},
	{
		id: "title",
		header: "Title",
		cell: ({ row }) => row.original.internal_movie?.media.name ?? row.original.title,
		meta: { class: { td: "max-w-[120px] truncate font-bold text-default" } },
	},
	{
		id: "synopsis",
		header: "Synopsis",
		cell: ({ row }) => row.original.internal_movie?.overview ?? row.original.overview,
		meta: { class: { td: "max-w-[300px] truncate" } },
	},
	{
		id: "adult",
		header: "Category",
		meta: { class: { th: "w-0 whitespace-nowrap", td: "w-0 whitespace-nowrap" } },
	},
	{
		id: "date",
		header: "Released At",
		meta: { class: { th: "w-0 whitespace-nowrap", td: "w-0 whitespace-nowrap" } },
	},
	{
		id: "vote",
		header: "Vote",
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
		onClick() {
			_focusSearchField();
		},
	},
];

// Get movies query
const total = computed(() => data.value?.total ?? 0);
const series = computed(() => data.value?.results ?? []);

const { data, pending, refresh, clear } = useClientAsyncData(
	() => trpc.tmdbMovie.search.query({ page: page.value, search: trimmedSearch.value }),
	{
		enabled: () => !!trimmedSearch.value,
		watch: [page],
		defaultErrorMessage: "Failed to fetch the movies",
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
	{ debounce: DEBOUNCE_TIMER },
);

// Helper methods
const _focusSearchField = () => {
	searchInput.value?.inputRef?.select();
	searchInput.value?.inputRef?.focus();
};

const _updateMovieInternalId = (externalId: string, internalMovie?: MovieWithMedia) => {
	const target = data.value?.results.find((m) => m.id === externalId);
	if (target) {
		target.internal_movie = internalMovie;
	}
};

// Methods
const addMovieToMyList = async (tmdbMovie: TmdbMovieSearch) =>
	toast.withErrorToast(async () => {
		if (tmdbMovie.internal_movie?.id) {
			return;
		}

		const movie = await movieStore.createMovieFromExternal({ externalId: tmdbMovie.id });
		_updateMovieInternalId(tmdbMovie.id, movie);
	});

const removeMovieFromMyList = async (tmdbMovie: TmdbMovieSearch) =>
	toast.withErrorToast(async () => {
		if (!tmdbMovie.internal_movie?.id) {
			return;
		}

		await movieStore.deleteMovie({ id: tmdbMovie.internal_movie.id });
		_updateMovieInternalId(tmdbMovie.id, undefined);
	});

const onMovieSelected = async (tmdbMovie: TmdbMovieSearch) =>
	navigateTo({ path: `/app/movies/external/${tmdbMovie.id}` });
</script>
