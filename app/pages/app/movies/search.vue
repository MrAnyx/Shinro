<template>
	<div class="flex justify-between">
		<UInput ref="searchInput" v-model="search" placeholder="Search..." leading-icon="i-lucide-search">
			<template v-if="search?.length > 0" #trailing>
				<UButton
					color="neutral"
					variant="link"
					size="sm"
					icon="i-lucide-x"
					aria-label="Clear input"
					@click="resetSearchField"
				/>
			</template>
		</UInput>
		<UButton
			label="Refresh"
			leading-icon="i-lucide-rotate-cw"
			variant="subtle"
			color="neutral"
			@click="refresh()"
		/>
	</div>
	<UCard :ui="{ body: 'p-0! h-full' }" class="h-full">
		<UTable :data="data?.results" :columns="columns" :loading="pending" sticky class="h-full">
			<template #empty>
				<UEmpty
					title="No movie found"
					description="No movie exist with this title"
					variant="naked"
					icon="i-lucide-ban"
					:actions="emptyActions"
				></UEmpty>
			</template>
			<template #poster_path-cell="{ row }">
				<div class="w-14">
					<NuxtImg
						provider="tmdb"
						:src="row.original.poster_path"
						width="92"
						class="object-contain"
						v-if="row.original.poster_path"
					/>
					<NuxtImg src="https://placehold.co/500x750" loading="lazy" class="object-contain" v-else />
				</div>
			</template>
			<template #adult-cell="{ row }">
				<UBadge color="error" variant="subtle" v-if="row.original.adult">NSFW</UBadge>
				<UBadge color="success" variant="subtle" v-else>Safe</UBadge>
			</template>
			<template #release_date-cell="{ row }">
				<span>{{
					row.original.release_date
						? new Date(row.original.release_date).toLocaleString(undefined, {
								timeZone: "UTC",
								year: "numeric",
								month: "numeric",
								day: "numeric",
							})
						: ""
				}}</span>
			</template>
			<template #vote_average-cell="{ row }">
				<UBadge
					:color="getVoteColor(row.original.vote_average)"
					variant="subtle"
					v-if="row.original.vote_count > 0"
					>{{ row.original.vote_average }}</UBadge
				>
				<span v-else />
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
import type { TableColumn, ButtonProps, TableRow, BadgeProps } from "@nuxt/ui";
import { watchDebounced } from "@vueuse/core";

definePageMeta({
	layout: "app",
	middleware: ["auth"],
});

const trpc = useTrpc();
const movieStore = useMovieStore();
const toast = useToast();
const overlay = useOverlay();

const searchInput = useTemplateRef("searchInput");

const page = ref(1);
const search = ref("");
const loadingMovieIds = reactive(new Set<number>());

onMounted(() => {
	focusSearchField();
});

const { data, pending, refresh } = useAsyncData(
	"movies-search",
	async () => {
		if (!search.value.trim()) {
			return undefined;
		}

		try {
			return await trpc.tmdb.movies.query({ page: page.value, search: search.value.trim() });
		} catch {
			toast.add({
				title: "Oops!",
				description: "Something went wrong while searching movies",
				color: "error",
				type: "foreground",
			});
		}
	},
	{
		immediate: false,
		dedupe: "cancel",
	},
);

watchDebounced(page, () => refresh(), {
	debounce: DEBOUNCE_TIMER,
});

watchDebounced(
	search,
	() => {
		page.value = 1;
		refresh();
	},
	{
		debounce: DEBOUNCE_TIMER,
	},
);

const columns: TableColumn<TmdbMovieSearchDefaultView>[] = [
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
				td: "w-0",
			},
		},
	},
	{
		accessorKey: "release_date",
		header: "Released At",
		meta: {
			class: {
				td: "w-0",
			},
		},
	},
	{
		accessorKey: "vote_average",
		header: "Vote",
		meta: {
			class: {
				td: "w-0",
			},
		},
	},
	{
		id: "actions",
		meta: {
			class: {
				th: "w-0",
				td: "w-0 text-right",
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

const getVoteColor = (vote: number): BadgeProps["color"] => {
	if (vote >= 7) {
		return "success";
	} else if (vote >= 5) {
		return "warning";
	} else {
		return "error";
	}
};

const addMovieToMyList = async (row: TableRow<TmdbMovieSearchDefaultView>) => {
	try {
		loadingMovieIds.add(row.original.id);

		const movie = await movieStore.createMovieFromExternal({ externalId: row.original.id.toString() });

		if (!data.value) {
			return;
		}

		data.value = {
			...data.value,
			results: data.value.results.map((m) =>
				m.id === row.original.id ? Object.assign(m, { internalId: movie.id }) : m,
			),
		};
	} catch (err: any) {
		toast.add({
			title: "Oops!",
			description: "Something went wrong while adding a movie",
			color: "error",
			type: "foreground",
		});
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

		await movieStore.deleteMovie(row.original.internalId);

		if (!data.value) {
			return;
		}

		data.value = {
			...data.value,
			results: data.value.results.map((m) =>
				m.id === row.original.id ? Object.assign(m, { internalId: undefined }) : m,
			),
		};
	} catch (err: any) {
		toast.add({
			title: "Oops!",
			description: "Something went wrong while removing a movie",
			color: "error",
			type: "foreground",
		});
	} finally {
		loadingMovieIds.delete(row.original.id);
	}
};
</script>
