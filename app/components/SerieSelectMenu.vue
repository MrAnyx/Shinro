<template>
	<USelectMenu
		v-model="selectedSerie"
		:items="items"
		:loading="internalLoading"
		:disabled="props.disabled || internalLoading"
		value-key="id"
		placeholder="Select a series"
		leading-icon="i-lucide-tv-minimal-play"
	/>
</template>

<script setup lang="ts">
import type { SelectMenuItem, SelectMenuProps } from "@nuxt/ui";

import { SourceType } from "#prisma/enums";

const trpc = useTrpc();

const selectedSerie = defineModel<string>();

const props = defineProps<{} & Pick<SelectMenuProps, "disabled" | "loading">>();

const internalLoading = computed(() => props.loading || loadingSeries.value);
const items = computed<SelectMenuItem[]>(
	() => series.value?.results.map((serie) => ({ label: serie.media.name ?? "Untitled", id: serie.id })) ?? [],
);

// Only internal series can own internal seasons
const { data: series, pending: loadingSeries } = useClientAsyncData(
	() =>
		trpc.serie.getAll.query({
			force: true,
			source: SourceType.INTERNAL,
			orderBy: [{ sort: "media.name", order: "asc" }],
		}),
	{ defaultErrorMessage: "Failed to fetch series" },
);
</script>
