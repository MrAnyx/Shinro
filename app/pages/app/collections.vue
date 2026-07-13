<template>
	<UDashboardPanel id="collections">
		<template #header>
			<UDashboardNavbar title="Collections">
				<template #leading>
					<UDashboardSidebarCollapse />
				</template>

				<template #right>
					<UButton label="New collection" leading-icon="i-lucide-plus" @click="openCollectionFormModal()" />
				</template>
			</UDashboardNavbar>
		</template>

		<template #body>
			<div class="flex justify-between">
				<UInput v-model="search" placeholder="Search..." leading-icon="i-lucide-search">
					<template v-if="search?.length > 0" #trailing>
						<UButton color="neutral" variant="link" size="sm" icon="i-lucide-x" aria-label="Clear input" @click="resetSearchField" />
					</template>
				</UInput>
				<UButton label="Refresh" leading-icon="i-lucide-rotate-cw" variant="subtle" color="neutral" @click="refresh()" />
			</div>
			<UCard :ui="{ body: 'p-0! h-full' }" class="h-full">
				<UTable :data="data?.results" :columns="columns" :loading="pending" sticky class="h-full">
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
						<span>{{ row.original.createdAt.toLocaleString() }}</span>
					</template>
					<template #updatedAt-cell="{ row }">
						<span>{{ row.original.updatedAt.toLocaleString() }}</span>
					</template>
					<template #actions-cell="{ row }">
						<UDropdownMenu :content="{ align: 'end' }" :items="getRowActions(row)">
							<UButton variant="ghost" icon="i-lucide-ellipsis-vertical" color="neutral"> </UButton>
						</UDropdownMenu>
					</template>
				</UTable>
			</UCard>
			<UPagination v-model:page="page" :total="data?.total" :items-per-page="ITEMS_PER_PAGE" v-show="(data?.total ?? 0) > ITEMS_PER_PAGE" />
		</template>
	</UDashboardPanel>
</template>
<script setup lang="ts">
import type { TableColumn, ButtonProps, TableRow, DropdownMenuItem } from "@nuxt/ui";
import { watchDebounced } from "@vueuse/core";

import { LazyCollectionFormModal, LazyConfirmationModal } from "#components";

definePageMeta({
	layout: "app",
	middleware: ["auth"],
});

const overlay = useOverlay();
const trpc = useTrpc();
const collectionStore = useCollectionStore();
const toast = useToast();

const collectionFormModal = overlay.create(LazyCollectionFormModal);
const openCollectionFormModal = async (collection?: PureCollection) => {
	const instance = collectionFormModal.open({
		collection,
	});

	const result = await instance.result;

	if (result) {
		refresh();
	}
};

const confirmationModal = overlay.create(LazyConfirmationModal);
const openConfirmationModal = async (callback: () => Promise<void> | void) => {
	const instance = confirmationModal.open({
		callback,
	});

	const result = await instance.result;

	if (result) {
		refresh();
	}
};

const page = ref(1);
const search = ref("");
const { data, pending, refresh } = useAsyncData(
	"collections",
	async () => {
		try {
			return await trpc.collections.getAll.query({ page: page.value, search: search.value });
		} catch {
			toast.add({
				title: "Oops!",
				description: "Something went wrong while fetching the collections",
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

const columns: TableColumn<PureCollection>[] = [
	{
		accessorKey: "name",
		header: "Name",
		meta: {
			class: {
				td: "max-w-[120px] truncate font-bold",
			},
		},
	},
	{
		accessorKey: "description",
		header: "Description",
		meta: {
			class: {
				td: "max-w-[300px] truncate",
			},
		},
	},
	{
		accessorKey: "createdAt",
		header: "Created At",
	},
	{
		accessorKey: "updatedAt",
		header: "Updated At",
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

const getRowActions = (row: TableRow<PureCollection>): DropdownMenuItem[][] => [
	[
		{
			label: "Edit",
			onSelect() {
				openCollectionFormModal(row.original);
			},
		},
		{
			label: "Delete",
			color: "error",
			onSelect() {
				openConfirmationModal(async () => await collectionStore.deleteCollection(row.original.id));
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
</script>
