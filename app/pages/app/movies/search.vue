<template>
	<div class="flex justify-between">
		<UInput ref="searchInput" v-model="search" placeholder="Search..." leading-icon="i-lucide-search">
			<template v-if="search?.length > 0" #trailing>
				<UButton color="neutral" variant="link" size="sm" icon="i-lucide-x" aria-label="Clear input" @click="search = ''" />
			</template>
		</UInput>
		<UButton label="Refresh" leading-icon="i-lucide-rotate-cw" variant="subtle" color="neutral" @click="refresh()" />
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
					<img :src="`https://image.tmdb.org/t/p/w500${row.original.poster_path}`" class="object-contain" v-if="row.original.poster_path" />
					<img src="https://placehold.co/500x750" class="object-contain" v-else />
				</div>
			</template>
			<template #adult-cell="{ row }">
				<UBadge color="error" variant="subtle" v-if="row.original.adult">NSFW</UBadge>
				<UBadge color="success" variant="subtle" v-else>Safe</UBadge>
			</template>
			<template #release_date-cell="{ row }">
				<span>{{
					row.original.release_date
						? new Date(Date.parse(row.original.release_date)).toLocaleString(undefined, {
								timeZone: "UTC",
								year: "numeric",
								month: "numeric",
								day: "numeric",
							})
						: ""
				}}</span>
			</template>
			<template #vote_average-cell="{ row }">
				<UBadge :color="getVoteColor(row.original.vote_average)" variant="subtle" v-if="row.original.vote_count > 0">{{
					row.original.vote_average
				}}</UBadge>
				<span v-else></span>
			</template>
			<template #actions-cell="{ row }">
				<UButton variant="ghost" icon="i-lucide-circle-plus" color="neutral" />
			</template>
		</UTable>
	</UCard>
	<!-- <UPagination v-model:page="page" :total="data?.total" :items-per-page="ITEMS_PER_PAGE" v-show="(data?.total ?? 0) > ITEMS_PER_PAGE" /> -->
</template>

<script setup lang="ts">
import type { TableColumn, ButtonProps, TableRow, DropdownMenuItem, BadgeProps } from "@nuxt/ui";
import { watchDebounced } from "@vueuse/core";

definePageMeta({
	layout: "app",
	middleware: ["auth"],
});

const trpc = useTrpc();
const collectionStore = useCollectionStore();
const toast = useToast();

const searchInput = useTemplateRef("searchInput");

const page = ref(1);
const search = ref("");
const { data, pending, refresh } = useAsyncData(
	"movies-search",
	async () => {
		if (!search.value.trim()) {
			return [];
		}

		try {
			return await trpc.tmdb.movies.query({ page: page.value, search: search.value });
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

const columns: TableColumn<TMDbMovie>[] = [
	{
		accessorKey: "poster_path",
		header: "",
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
	},
	{
		accessorKey: "release_date",
		header: "Released At",
	},
	{
		accessorKey: "vote_average",
		header: "Vote",
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

const getRowActions = (row: TableRow<Collection>): DropdownMenuItem[][] => [
	[
		{
			label: "Edit",
			onSelect() {
				// openCollectionFormModal(row.original);
			},
		},
		{
			label: "Delete",
			color: "error",
			onSelect() {
				// openConfirmationModal(async () => await collectionStore.deleteCollection(row.original.id));
			},
		},
	],
];

const emptyActions: ButtonProps[] = [
	{
		icon: "i-lucide-search",
		label: "Search",
		onClick() {
			searchInput.value?.inputRef?.select();
			searchInput.value?.inputRef?.focus();
		},
	},
];

const getVoteColor = (vote: number): BadgeProps["color"] => {
	if (vote >= 7) {
		return "success";
	} else if (vote >= 5) {
		return "warning";
	} else {
		return "error";
	}
};
</script>
