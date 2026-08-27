<template>
	<div class="flex justify-between">
		<SearchInput v-model="search" ref="searchInput" />
		<UButton
			label="Refresh"
			leading-icon="i-lucide-rotate-cw"
			variant="subtle"
			color="neutral"
			@click="refresh()"
		/>
	</div>
	<UCard :ui="{ body: 'p-0! h-full' }" class="h-full">
		<UTable
			:data="data?.results"
			:columns="columns"
			:loading="pending"
			sticky
			class="h-full"
			@select="onSerieSelected"
		>
			<template #empty>
				<UEmpty
					title="No serie found"
					description="No serie exist with this title"
					variant="naked"
					icon="i-lucide-ban"
					:actions="emptyActions"
				></UEmpty>
			</template>
			<template #poster_path-cell="{ row }">
				<ImageFallback
					:width="60"
					:height="90"
					class="rounded-sm"
					provider="tmdb"
					:src="row.original.poster_path"
				/>
			</template>
			<template #adult-cell="{ row }">
				<UBadge color="error" variant="subtle" v-if="row.original.adult">18+</UBadge>
				<UBadge color="success" variant="subtle" v-else>Safe</UBadge>
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
				<VoteBadge :average="row.original.vote_average" :count="row.original.vote_count" />
			</template>
			<template #actions-cell="{ row }">
				<UButton
					v-if="!row.original.internalId"
					variant="ghost"
					icon="i-lucide-circle-plus"
					color="neutral"
					@click="addSerieToMyList(row)"
					:loading="loadingSerieIds.has(row.original.id)"
					:disabled="loadingSerieIds.has(row.original.id)"
				/>
				<UButton
					v-else
					variant="ghost"
					icon="i-lucide-circle-minus"
					color="error"
					@click="removeSerieFromMyList(row)"
					:loading="loadingSerieIds.has(row.original.id)"
					:disabled="loadingSerieIds.has(row.original.id)"
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
const serieStore = useSerieStore();
const toast = useStatusToast();
const { search, page } = useSearchPagination();

const searchInput = useTemplateRef("searchInput");

const loadingSerieIds = reactive(new Set<string>());

onMounted(() => {
	focusSearchField();
});

const { data, pending, refresh } = useAsyncData(
	async () => {
		if (!search.value.trim()) {
			return undefined;
		}

		try {
			return await trpc.tmdbSerie.search.query({ page: page.value, search: search.value.trim() });
		} catch (err) {
			toast.error(err);
		}
	},
	{
		dedupe: "cancel",
	},
);

watchDebounced([page, search], () => refresh(), {
	debounce: DEBOUNCE_TIMER,
});

const columns: TableColumn<TmdbSerieSearchDefaultView>[] = [
	{
		accessorKey: "poster_path",
		header: "",
		meta: {
			class: {
				td: "w-[60px]",
			},
		},
	},
	{
		accessorKey: "name",
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
				th: "w-0",
				td: "w-0",
			},
		},
	},
	{
		accessorKey: "first_air_date",
		header: "Released At",
		meta: {
			class: {
				th: "w-0",
				td: "w-0",
			},
		},
	},
	{
		accessorKey: "vote_average",
		header: "Vote",
		meta: {
			class: {
				th: "w-0",
				td: "w-0",
			},
		},
	},
	{
		id: "actions",
		meta: {
			class: {
				th: "w-0",
				td: "w-0",
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

const addSerieToMyList = async (row: TableRow<TmdbSerieSearchDefaultView>) => {
	try {
		loadingSerieIds.add(row.original.id);

		const serie = await serieStore.createSerieFromExternal({ externalId: row.original.id });

		if (!data.value) {
			return;
		}

		data.value = {
			...data.value,
			results: data.value.results.map((m) =>
				m.id === row.original.id ? Object.assign(m, { internalId: serie.id }) : m,
			),
		};

		toast.success({ description: `${serie.media.name} has been added to your list` });
	} catch (err: any) {
		toast.error(err);
	} finally {
		loadingSerieIds.delete(row.original.id);
	}
};

const removeSerieFromMyList = async (row: TableRow<TmdbSerieSearchDefaultView>) => {
	try {
		loadingSerieIds.add(row.original.id);

		if (!row.original.internalId) {
			return;
		}

		await serieStore.deleteSerie({ id: row.original.internalId });

		if (!data.value) {
			return;
		}

		data.value = {
			...data.value,
			results: data.value.results.map((m) =>
				m.id === row.original.id ? Object.assign(m, { internalId: undefined }) : m,
			),
		};

		toast.success({ description: `${row.original.name} has been removed from your list` });
	} catch (err: any) {
		toast.error(err);
	} finally {
		loadingSerieIds.delete(row.original.id);
	}
};

const onSerieSelected = async (e: Event, row: TableRow<TmdbSerieSearchDefaultView>) => {
	await navigateTo({ path: `/app/series/external/${row.original.id}` });
};
</script>
