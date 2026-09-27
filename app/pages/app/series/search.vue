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
			<template #first_air_date-cell="{ row }">
				<NuxtTime
					v-if="row.original.first_air_date"
					:datetime="row.original.first_air_date"
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
					:is-added="!!row.original.internal_serie"
					:onClickOn="() => addSerieToMyList(row.original)"
					:onClickOff="() => removeSerieFromMyList(row.original)"
				/>
			</template>
		</UTable>
	</UCard>
	<UPagination
		v-model:page="page"
		:total="data?.total"
		:items-per-page="TMDB_ITEMS_PER_PAGE"
		v-if="(data?.total ?? 0) > TMDB_ITEMS_PER_PAGE"
	/>
</template>

<script setup lang="ts">
import type { TableColumn, ButtonProps, TableRow } from "@nuxt/ui";
import { watchDebounced } from "@vueuse/core";

const trpc = useTrpc();
const serieStore = useSerieStore();
const toast = useStatusToast();
const { search, page, trimmedSearch } = useSearchPagination();

const searchInput = useTemplateRef("searchInput");

onMounted(() => {
	focusSearchField();
});

const { data, pending, refresh, clear } = useClientAsyncData(
	() => trpc.tmdbSerie.search.query({ page: page.value, search: trimmedSearch.value }),
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

const columns: TableColumn<TmdbSerieSearchDefaultView>[] = [
	{
		id: "image",
		meta: {
			class: {
				td: "w-[60px]",
			},
		},
	},
	{
		accessorFn: (row) => row.internal_serie?.media.name ?? row.name,
		header: "Title",
		meta: {
			class: {
				td: "max-w-[120px] truncate font-bold text-default",
			},
		},
	},
	{
		accessorFn: (row) => row.internal_serie?.overview ?? row.overview,
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
		id: "first_air_date",
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

const updateSerieInternalId = (externalId: string, internalSerie?: SerieWithMediaView) => {
	const target = data.value?.results.find((m) => m.id === externalId);
	if (target) {
		target.internal_serie = internalSerie;
	}
};

const addSerieToMyList = async (serie: TmdbSerieSearchDefaultView) => {
	try {
		const newSerie = await serieStore.createSerieFromExternal({ externalId: serie.id });
		updateSerieInternalId(serie.id, newSerie);
	} catch (err: any) {
		toast.error(err);
	}
};

const removeSerieFromMyList = async (serie: TmdbSerieSearchDefaultView) => {
	try {
		if (!serie.internal_serie?.id) {
			return;
		}

		await serieStore.deleteSerie({ id: serie.internal_serie.id });
		updateSerieInternalId(serie.id, undefined);
	} catch (err: any) {
		toast.error(err);
	}
};

const onSerieSelected = async (serie: TmdbSerieSearchDefaultView) => {
	await navigateTo({ path: `/app/series/external/${serie.id}` });
};
</script>
