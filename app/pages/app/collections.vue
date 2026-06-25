<template>
	<UDashboardPanel id="collections">
		<template #header>
			<UDashboardNavbar title="Collections">
				<template #leading>
					<UDashboardSidebarCollapse />
				</template>

				<template #right>
					<UButton label="New collection" leading-icon="i-lucide-plus" @click="newCollectionModal.open()" />
				</template>
			</UDashboardNavbar>
		</template>

		<template #body>
			<div class="flex justify-between">
				<UInput placeholder="Search..." leading-icon="i-lucide-search"></UInput>
				<UButton label="Refresh" leading-icon="i-lucide-rotate-cw" variant="subtle" color="neutral" @click="refresh()" />
			</div>
			<UCard :ui="{ body: 'p-0!' }" class="h-full">
				<UTable :data="data?.results" :columns="columns" :loading="pending" :ui="{ tr: 'hover:bg-elevated/50' }">
					<template #empty>
						<UEmpty
							title="No collections"
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
				</UTable>
			</UCard>
		</template>
	</UDashboardPanel>
</template>
<script setup lang="ts">
import type { TableColumn, ButtonProps } from "@nuxt/ui";

import { LazyAddCollectionModal } from "#components";

definePageMeta({
	layout: "app",
	middleware: ["auth"],
});

const overlay = useOverlay();
const trpc = useTrpc();

const newCollectionModal = overlay.create(LazyAddCollectionModal, {
	props: {},
});

const { data, pending, refresh } = useAsyncData("collections", () => trpc.collections.getAll.query({ page: 1 }));

const columns: TableColumn<Collection>[] = [
	{
		accessorKey: "name",
		header: "Name",
	},
	{
		accessorKey: "description",
		header: "Description",
		meta: {
			class: {
				td: "max-w-[200px] truncate",
				th: "max-w-[200px]",
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
];

const emptyActions: ButtonProps[] = [
	{
		icon: "i-lucide-plus",
		label: "New collection",
		onClick() {
			newCollectionModal.open();
		},
	},
];
</script>
