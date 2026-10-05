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
			@select="(_e, row) => onSerieSelected(row.original)"
		>
			<template #empty>
				<UEmpty
					title="No serie found"
					description="No serie exist with this title"
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
					v-if="row.original.first_air_date"
					:datetime="row.original.first_air_date"
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
					:is-added="!!row.original.internal_serie"
					:onClickOn="() => addSerieToMyList(row.original)"
					:onClickOff="() => removeSerieFromMyList(row.original)"
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
const serieStore = useSerieStore();
const toast = useStatusToast();
const { search, page, trimmedSearch } = useSearchPagination();
const searchInput = useTemplateRef("searchInput");

// Lifecycle hooks
onMounted(() => {
	_focusSearchField();
});

// Table structure
const columns: TableColumn<TmdbSerieSearch>[] = [
	{
		id: "image",
		meta: { class: { td: "w-[60px]" } },
	},
	{
		id: "title",
		header: "Title",
		cell: ({ row }) => row.original.internal_serie?.media.name ?? row.original.name,
		meta: { class: { td: "max-w-[120px] truncate font-bold text-default" } },
	},
	{
		id: "synopsis",
		header: "Synopsis",
		cell: ({ row }) => row.original.internal_serie?.overview ?? row.original.overview,
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

// Get series query
const total = computed(() => data.value?.total ?? 0);
const series = computed(() => data.value?.results ?? []);

const { data, pending, refresh, clear } = useClientAsyncData(
	() => trpc.tmdbSerie.search.query({ page: page.value, search: trimmedSearch.value }),
	{
		enabled: () => !!trimmedSearch.value,
		watch: [page],
		defaultErrorMessage: "Failed to fetch the series",
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

const _updateSerieInternalSerie = (externalId: string, internalSerie?: SerieWithMedia) => {
	const target = data.value?.results.find((m) => m.id === externalId);
	if (target) {
		target.internal_serie = internalSerie;
	}
};

// Methods
const addSerieToMyList = async (tmdbSerie: TmdbSerieSearch) =>
	toast.withErrorToast(async () => {
		if (tmdbSerie.internal_serie?.id) {
			return;
		}

		const newSerie = await serieStore.createSerieFromExternal({ externalId: tmdbSerie.id });
		_updateSerieInternalSerie(tmdbSerie.id, newSerie);
	});

const removeSerieFromMyList = async (tmdbSerie: TmdbSerieSearch) =>
	toast.withErrorToast(async () => {
		if (!tmdbSerie.internal_serie?.id) {
			return;
		}

		await serieStore.deleteSerie({ id: tmdbSerie.internal_serie.id });
		_updateSerieInternalSerie(tmdbSerie.id, undefined);
	});

const onSerieSelected = (tmdbSerie: TmdbSerieSearch) => navigateTo({ path: `/app/series/external/${tmdbSerie.id}` });
</script>
