<template>
	<USelectMenu
		v-model="selectedValue"
		v-model:search-term="searchTerm"
		:items="items"
		:loading="loading"
		:disabled="disabled"
		value-key="id"
		placeholder="Search internal seasons"
		leading-icon="i-lucide-layers"
		ignore-filter
	>
		<span v-if="selectedItem">{{ selectedItem.label }}</span>
		<span v-else class="text-dimmed">Search internal seasons</span>
	</USelectMenu>
</template>

<script setup lang="ts">
import type { SelectMenuItem } from "@nuxt/ui";
import { watchDebounced } from "@vueuse/core";

import { SourceType } from "#prisma/enums";

const props = defineProps<{ initialSeason: SeasonWithSerie; disabled?: boolean }>();
const selectedSeason = defineModel<string>();
const trpc = useTrpc();
const toast = useStatusToast();
type SeasonItem = SelectMenuItem & { id: string; label: string };
const toItem = (season: SeasonWithSerie): SeasonItem => ({
	id: season.id,
	label: `${season.serie.media.name ?? "Untitled"} - ${season.media.name ?? `Season ${season.number}`}`,
});
const searchTerm = ref("");
const items = ref<SeasonItem[]>([]);
const selectedItem = ref<SeasonItem | undefined>(toItem(props.initialSeason));
const loading = ref(false);
const selectedValue = computed({
	get: () => selectedSeason.value,
	set: (id) => {
		selectedItem.value = items.value.find((item) => item.id === id);
		selectedSeason.value = id;
	},
});

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
		loading.value = false;
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
		loading.value = true;
		try {
			const seasons = await trpc.season.getAll.query({ page: 1, search, source: SourceType.INTERNAL });
			if (version === searchVersion) {
				items.value = seasons.results.map(toItem);
			}
		} catch (error) {
			if (version === searchVersion) {
				toast.error(error, { description: "Failed to fetch seasons" });
			}
		} finally {
			if (version === searchVersion) {
				loading.value = false;
			}
		}
	},
	{ debounce: DEBOUNCE_TIMER },
);
</script>
