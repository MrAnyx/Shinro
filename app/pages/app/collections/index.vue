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
			@select="(e, row) => onCollectionSelected(row)"
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
				<ToggleButton
					variant="ghost"
					on-icon="i-ph-star-fill"
					off-icon="i-ph-star"
					on-color="warning"
					off-color="neutral"
					:is-added="row.original.favorite"
					:onClickOn="() => toggleCollectionFavorite(row)"
					:onClickOff="() => toggleCollectionFavorite(row)"
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
		v-if="(data?.total ?? 0) > ITEMS_PER_PAGE"
	/>
</template>
<script setup lang="ts">
import type { TableColumn, ButtonProps, TableRow, DropdownMenuItem } from "@nuxt/ui";
import { watchDebounced } from "@vueuse/core";

import { LazyCollectionFormModal } from "#components";

const overlay = useOverlay();
const trpc = useTrpc();
const collectionStore = useCollectionStore();
const toast = useStatusToast();
const { openConfirmationModal } = useConfirmation();
const { search, page, trimmedSearch } = useSearchPagination();

const collectionFormModal = overlay.create(LazyCollectionFormModal);
const openCollectionFormModal = async (collection?: CollectionDefaultView) => {
	const instance = collectionFormModal.open({
		id: collection?.id,
	});

	const result = await instance.result;

	if (result) {
		// Refresh as it may change the order
		refresh();
	}
};

const { data, pending, refresh } = useClientAsyncData(
	() => trpc.collection.getAll.query({ page: page.value, search: trimmedSearch.value }),
	{ watch: [page] },
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
				td: "max-w-[120px] truncate font-bold text-default",
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
				toast.withErrorToast(async () => {
					const result = await openConfirmationModal(() =>
						collectionStore.deleteCollection({ id: row.original.id }),
					);

					if (result) {
						// Delete the selected element. No need to refresh here
						data.value.results = data.value.results.filter((m) => m.id !== row.original.id);
						toast.success({ description: `Collection ${row.original.name} has been deleted` });
					}
				});
			},
		},
	],
];

const emptyActions: ButtonProps[] = [
	{
		icon: "i-lucide-plus",
		label: "New collection",
		onClick() {
			openCollectionFormModal();
		},
	},
];

const toggleCollectionFavorite = async (row: TableRow<CollectionDefaultView>) =>
	toast.withErrorToast(async () => {
		const collection = await trpc.collection.update.mutate({
			id: row.original.id,
			favorite: !row.original.favorite,
		});

		if (!data.value) {
			return;
		}

		// Update the collection list
		const idx = data.value.results.findIndex((m) => m.id === row.original.id);
		if (idx !== -1) {
			data.value.results = data.value.results.with(idx, collection);
		}

		toast.success({
			description: row.original.favorite
				? "Collection removed from your favorites"
				: "Collection added to your favorites",
		});
	});

const onCollectionSelected = async (row: TableRow<CollectionDefaultView>) => {
	await navigateTo({ path: `/app/collections/${row.original.id}` });
};
</script>
