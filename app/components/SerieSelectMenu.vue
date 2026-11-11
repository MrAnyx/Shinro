<template>
	<USelectMenu
		v-model="selectedValue"
		v-model:search-term="searchTerm"
		:items="items"
		:loading="internalLoading"
		:disabled="props.disabled || props.loading"
		value-key="id"
		placeholder="Select a series"
		leading-icon="i-lucide-tv-minimal-play"
		ignore-filter
	>
		<span v-if="selectedItem">{{ selectedItem.label }}</span>
		<span v-else class="text-dimmed">Select a series</span>
	</USelectMenu>
</template>

<script setup lang="ts">
import type { SelectMenuItem, SelectMenuProps } from "@nuxt/ui";
import { watchDebounced } from "@vueuse/core";

import { SourceType } from "#prisma/enums";

const trpc = useTrpc();
const toast = useStatusToast();

const selectedSerie = defineModel<string>();

const props = defineProps<{} & Pick<SelectMenuProps, "disabled" | "loading">>();

type SerieItem = SelectMenuItem & { id: string; label: string };
const searchTerm = ref("");
const items = ref<SerieItem[]>([]);
const selectedItem = ref<SerieItem>();
const loadingSeries = ref(false);
const loadingSelection = ref(false);
const internalLoading = computed(() => props.loading || loadingSeries.value || loadingSelection.value);
const selectedValue = computed({
	get: () => selectedSerie.value,
	set: (id) => {
		selectedItem.value = items.value.find((item) => item.id === id);
		selectedSerie.value = id;
	},
});

watch(
	selectedSerie,
	async (id, _previous, onCleanup) => {
		let cancelled = false;
		onCleanup(() => {
			cancelled = true;
		});
		if (!id) {
			selectedItem.value = undefined;
			loadingSelection.value = false;
			return;
		}
		if (selectedItem.value?.id === id) {
			loadingSelection.value = false;
			return;
		}
		selectedItem.value = undefined;
		loadingSelection.value = true;
		try {
			const serie = await trpc.serie.getById.query({ type: "id", id });
			if (!cancelled) {
				selectedItem.value = { id: serie.id, label: serie.media.name ?? "Untitled" };
			}
		} catch (error) {
			if (!cancelled) {
				toast.error(error, { description: "Failed to fetch selected series" });
			}
		} finally {
			if (!cancelled) {
				loadingSelection.value = false;
			}
		}
	},
	{ immediate: true },
);

let searchVersion = 0;
let disposed = false;
onScopeDispose(() => {
	disposed = true;
	searchVersion++;
});
watch(
	searchTerm,
	() => {
		searchVersion++;
		items.value = [];
		loadingSeries.value = false;
	},
	{ flush: "sync" },
);

watchDebounced(
	searchTerm,
	async (value) => {
		const search = value.trim();
		if (!search || disposed) {
			return;
		}
		const version = searchVersion;
		loadingSeries.value = true;
		try {
			const series = await trpc.serie.getAll.query({
				search,
				page: 1,
				source: SourceType.INTERNAL,
				orderBy: [{ sort: "media.name", order: "asc" }],
			});
			if (version === searchVersion) {
				items.value = series.results.map((serie) => ({ label: serie.media.name ?? "Untitled", id: serie.id }));
			}
		} catch (error) {
			if (version === searchVersion) {
				toast.error(error, { description: "Failed to fetch series" });
			}
		} finally {
			if (version === searchVersion) {
				loadingSeries.value = false;
			}
		}
	},
	{ debounce: DEBOUNCE_TIMER },
);
</script>
