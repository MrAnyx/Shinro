<template>
	<USelectMenu
		:items="internalCollections"
		v-model="selectedCollections"
		:loading="internalLoading"
		:variant="props.variant"
		multiple
		value-key="id"
		placeholder="Select some collections"
		leading-icon="i-lucide-folder"
		clear
	/>
</template>

<script setup lang="ts">
import type { SelectMenuItem, SelectMenuProps } from "@nuxt/ui";

const trpc = useTrpc();

const selectedCollections = defineModel<string[]>();

const props = defineProps<
	{
		loading?: boolean;
	} & Pick<SelectMenuProps, "variant">
>();

const internalLoading = computed(() => props.loading || loadingCollections.value);
const internalCollections = computed(
	() =>
		collections.value?.results.map(
			(x) =>
				({
					label: x.name,
					id: x.id,
					icon: x.favorite ? "i-ph-star-fill" : undefined,
					ui: {
						itemLeadingIcon: x.favorite ? "text-warning" : undefined,
					},
				}) as SelectMenuItem,
		) ?? [],
);

const { data: collections, pending: loadingCollections } = useSafeAsyncData(() =>
	trpc.collection.getAll.query({
		force: true,
		orderBy: [
			{ sort: "favorite", order: "desc" },
			{ sort: "name", order: "asc" },
		],
	}),
);
</script>
