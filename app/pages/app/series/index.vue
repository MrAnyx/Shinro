<template>
	<div class="flex justify-between">
		<UInput v-model="search" placeholder="Search..." leading-icon="i-lucide-search">
			<template v-if="search?.length > 0" #trailing>
				<UButton color="neutral" variant="link" size="sm" icon="i-lucide-x" @click="resetSearchField" />
			</template>
		</UInput>

		<div class="flex gap-2">
			<UButton
				label="Refresh"
				leading-icon="i-lucide-rotate-cw"
				variant="subtle"
				color="neutral"
				@click="refresh()"
			/>
			<UButton label="New serie" leading-icon="i-lucide-plus" @click="openSerieFormModal()" />
		</div>
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
					description="Add your first serie to get started"
					variant="naked"
					icon="i-lucide-ban"
					:actions="emptyActions"
				></UEmpty>
			</template>
			<template #image-cell="{ row }">
				<ImageFallback
					:width="60"
					:height="90"
					class="rounded-sm"
					provider="tmdb"
					:src="row.original.media.imagePath"
				/>
			</template>
			<template #status-cell="{ row }">
				<StatusBadge
					v-if="row.original.media.status"
					:type="row.original.media.type"
					:status="row.original.media.status"
					variant="subtle"
				/>
			</template>
			<template #createdAt-cell="{ row }">
				<NuxtTime
					:datetime="row.original.media.createdAt"
					year="numeric"
					month="short"
					day="numeric"
					hour="2-digit"
					minute="2-digit"
				/>
			</template>
			<template #actions-cell="{ row }">
				<UDropdownMenu :content="{ align: 'end' }" :items="getRowActions(row)">
					<UButton variant="ghost" icon="i-lucide-ellipsis-vertical" color="neutral" />
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

import { LazySerieFormModal } from "#components";

const overlay = useOverlay();
const trpc = useTrpc();
const serieStore = useSerieStore();
const toast = useToast();
const { openConfirmationModal } = useConfirmation();
const { search, page } = useSearchPagination();

const serieFormModal = overlay.create(LazySerieFormModal);
const openSerieFormModal = async (serie?: SerieWithMediaView) => {
	const instance = serieFormModal.open({ serie });

	const result = await instance.result;

	if (result) {
		refresh();
	}
};

const { data, pending, refresh } = useAsyncData(
	"series",
	async () => {
		try {
			return await trpc.serie.getAll.query({ page: page.value, search: search.value });
		} catch {
			toast.add({
				title: "Oops!",
				description: "Something went wrong while fetching the series",
				color: "error",
				type: "foreground",
			});
		}
	},
	{
		dedupe: "cancel",
	},
);

watchDebounced([page, search], () => refresh(), {
	debounce: DEBOUNCE_TIMER,
});

const columns: TableColumn<SerieWithMediaView>[] = [
	{
		header: "",
		id: "image",
		meta: {
			class: {
				td: "w-[60px]",
			},
		},
	},
	{
		accessorFn: (x) => x.media.name,
		header: "Title",
		meta: {
			class: {
				td: "max-w-[120px] truncate font-bold",
			},
		},
	},
	{
		accessorKey: "overview",
		header: "Overview",
		meta: {
			class: {
				td: "max-w-[300px] truncate",
			},
		},
	},
	{
		header: "Status",
		id: "status",
		meta: {
			class: {
				th: "w-0",
				td: "w-0",
			},
		},
	},
	{
		header: "Created At",
		id: "createdAt",
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

const getRowActions = (row: TableRow<SerieWithMediaView>): DropdownMenuItem[][] => [
	[
		{
			label: "Edit",
			icon: "i-lucide-square-pen",
			onSelect() {
				openSerieFormModal(row.original);
			},
		},
		{
			label: "Delete",
			icon: "i-lucide-trash",
			color: "error",
			async onSelect() {
				const result = await openConfirmationModal(
					async () => await serieStore.deleteSerie({ id: row.original.id }),
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
		icon: "i-lucide-search",
		label: "Search",
		async onClick() {
			await navigateTo({
				path: "/app/series/search",
			});
		},
	},
];

const onSerieSelected = async (e: Event, row: TableRow<SerieWithMediaView>) => {
	if (row.original.media.externalId) {
		await navigateTo(`/app/series/external/${row.original.media.externalId}`);
	} else {
		await navigateTo(`/app/series/internal/${row.original.id}`);
	}
};
</script>
