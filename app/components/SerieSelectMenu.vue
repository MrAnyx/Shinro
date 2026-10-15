<template>
	<USelectMenu
		v-model="selectedSerie"
		v-model:search-term="search"
		:items="internalSeries"
		:loading="props.loading"
		:search-input="{ icon: 'i-lucide-search', loading: loadingSeries }"
		:disabled="props.disabled || props.loading"
		:variant="props.variant"
		:highlight="props.highlight"
		:color="props.color"
		:ui="{ empty: 'truncate' }"
		ignore-filter
		value-key="id"
		by="id"
		placeholder="Select a serie"
		leading-icon="i-lucide-tv-minimal-play"
		clear
	>
		<template #empty>
			<span v-if="loadingSeries">Loading series...</span>
			<span v-else-if="!trimmedSearch">Type to search for a serie</span>
			<span v-else>No series found for "{{ trimmedSearch }}"</span>
		</template>
	</USelectMenu>
</template>

<script setup lang="ts">
import type { SelectMenuItem, SelectMenuProps } from "@nuxt/ui";
import { watchDebounced } from "@vueuse/core";

import type { SourceType } from "#prisma/enums";

const trpc = useTrpc();

const props = defineProps<
	{
		fallbackSerie?: Serie;
		source?: SourceType;
	} & Pick<SelectMenuProps, "variant" | "disabled" | "loading" | "color" | "highlight">
>();

const selectedSerie = defineModel<string>();
const search = ref("");
const trimmedSearch = computed(() => search.value.trim());

// Cache of the selected item, so its label is still displayed
// after the search is reset and the results are cleared
const selectedItem = ref<SelectMenuItem & { id: string }>();

const {
	data: series,
	pending: loadingSeries,
	execute: refreshSeries,
	clear: clearSeries,
} = useClientAsyncData(
	() =>
		trpc.serie.getAll.query({
			page: 1,
			orderBy: [{ sort: "media.name", order: "asc" }],
			source: props.source,
			search: trimmedSearch.value,
		}),
	{
		enabled: () => !!trimmedSearch.value,
	},
);

watchDebounced(
	trimmedSearch,
	() => {
		if (!trimmedSearch.value) {
			clearSeries();
		} else {
			refreshSeries();
		}
	},
	{ debounce: DEBOUNCE_TIMER },
);

// Remember the item when the user picks one
watch(selectedSerie, (id) => {
	if (!id) {
		selectedItem.value = undefined;
		return;
	}

	const found = series.value?.results.find((x) => x.id === id);
	if (found) {
		selectedItem.value = { label: found.media.name ?? "", id: found.id, serie: found };
	}
});

const internalSeries = computed<SelectMenuItem[]>(() => {
	const items: SelectMenuItem[] =
		series.value?.results.map((x) => ({
			label: x.media.name ?? "",
			id: x.id,
			serie: x,
		})) ?? [];

	// Keep the current selection in the list so its label can be resolved
	let current: (SelectMenuItem & { id: string }) | undefined;
	if (selectedItem.value && selectedItem.value.id === selectedSerie.value) {
		current = selectedItem.value;
	} else if (props.fallbackSerie && props.fallbackSerie.id === selectedSerie.value) {
		current = { label: props.fallbackSerie.media.name ?? "", id: props.fallbackSerie.id };
	}

	if (current && !items.some((i: any) => i.id === current.id)) {
		items.unshift(current);
	}

	return items;
});
</script>
