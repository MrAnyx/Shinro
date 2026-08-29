<template>
	<div class="flex justify-between">
		<SearchInput v-model="search" />
		<div class="flex gap-2">
			<RefreshButton @click="refresh()" />
			<UButton label="New collection" leading-icon="i-lucide-plus" @click="openCollectionFormModal()" />
		</div>
	</div>
	<UCard :ui="{ body: 'p-0! h-full' }" class="h-full">
		<UTable
			:data="data?.results"
			:columns="columns"
			:loading="pending"
			sticky
			class="h-full"
			@select="onCollectionSelected"
		>
			<template #empty>
				<UEmpty
					title="No collection found"
					description="Create your first collection"
					variant="naked"
					icon="i-lucide-ban"
					:actions="emptyActions"
				></UEmpty>
			</template>
			<template #createdAt-cell="{ row }">
				<NuxtTime
					:datetime="row.original.createdAt"
					year="numeric"
					month="short"
					day="numeric"
					hour="2-digit"
					minute="2-digit"
				/>
			</template>
			<template #updatedAt-cell="{ row }">
				<NuxtTime
					:datetime="row.original.updatedAt"
					year="numeric"
					month="short"
					day="numeric"
					hour="2-digit"
					minute="2-digit"
				/>
			</template>
			<template #favorite-cell="{ row }">
				<UButton
					:icon="row.original.favorite ? 'i-ph-star-fill' : 'i-ph-star'"
					variant="ghost"
					:color="row.original.favorite ? 'warning' : 'neutral'"
					@click="toggleCollectionFavorite(row)"
					:disabled="loadingCollectionIds.has(row.original.id)"
					:loading="loadingCollectionIds.has(row.original.id)"
				/>
			</template>
			<template #actions-cell="{ row }">
				<UDropdownMenu :content="{ align: 'end' }" :items="getRowActions(row)">
					<UButton variant="ghost" icon="i-lucide-ellipsis-vertical" color="neutral"> </UButton>
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

import { LazyCollectionFormModal } from "#components";

const loadingCollectionIds = reactive(new Set<string>());

const overlay = useOverlay();
const trpc = useTrpc();
const collectionStore = useCollectionStore();
const toast = useStatusToast();
const { openConfirmationModal } = useConfirmation();
const { search, page, trimmedSearch } = useSearchPagination();

const collectionFormModal = overlay.create(LazyCollectionFormModal);
const openCollectionFormModal = async (collection?: CollectionDefaultView) => {
	const instance = collectionFormModal.open({
		collection,
	});

	const result = await instance.result;

	if (result) {
		refresh();
	}
};

const { data, pending, refresh } = useSafeAsyncData(
	() => trpc.collection.getAll.query({ page: page.value, search: trimmedSearch.value }),
	{
		watch: [page],
	},
);

watchDebounced(trimmedSearch, () => refresh(), {
	debounce: DEBOUNCE_TIMER,
});

const columns: TableColumn<CollectionDefaultView>[] = [
	{
		header: "Name",
		accessorKey: "name",
		meta: {
			class: {
				td: "max-w-[120px] truncate font-bold",
			},
		},
	},
	{
		header: "Description",
		accessorKey: "description",
		meta: {
			class: {
				td: "max-w-[300px] truncate",
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
		header: "Updated At",
		id: "updatedAt",
		meta: {
			class: {
				th: "w-0 whitespace-nowrap",
				td: "w-0 whitespace-nowrap",
			},
		},
	},
	{
		header: "Favorite",
		id: "favorite",
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

const getRowActions = (row: TableRow<CollectionDefaultView>): DropdownMenuItem[][] => [
	[
		{
			label: "Edit",
			icon: "i-lucide-square-pen",
			onSelect() {
				openCollectionFormModal(row.original);
			},
		},
		{
			label: "Delete",
			icon: "i-lucide-trash",
			color: "error",
			async onSelect() {
				const result = await openConfirmationModal(
					async () => await collectionStore.deleteCollection({ id: row.original.id }),
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
		icon: "i-lucide-plus",
		label: "New collection",
		onClick() {
			openCollectionFormModal();
		},
	},
];

const toggleCollectionFavorite = async (row: TableRow<CollectionDefaultView>) => {
	try {
		loadingCollectionIds.add(row.original.id);

		const collection = await trpc.collection.update.mutate({
			id: row.original.id,
			favorite: !row.original.favorite,
		});

		if (!data.value) {
			return;
		}

		data.value = {
			...data.value,
			results: data.value.results.map((m) => (m.id === row.original.id ? collection : m)),
		};

		toast.success({
			description: row.original.favorite
				? "Collection removed from your favorites"
				: "Collection added to your favorites",
		});
	} catch (err: any) {
		toast.error(err);
	} finally {
		loadingCollectionIds.delete(row.original.id);
	}
};

const onCollectionSelected = async (e: Event, row: TableRow<CollectionDefaultView>) => {
	await navigateTo({ path: `/app/collections/${row.original.id}` });
};
</script>
