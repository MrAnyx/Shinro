<template>
	<USelectMenu
		v-model="status"
		:items="statuses"
		:loading="props.loading"
		:variant="props.variant"
		:disabled="props.disabled"
		value-key="value"
		placeholder="Select a status"
		leading-icon="i-lucide-circle-dot-dashed"
		clear
	>
		<template #leading="{ ui }">
			<UChip
				v-if="status"
				v-bind="{ color: STATUS_COLORS[status] }"
				inset
				standalone
				:class="ui.itemLeadingChip()"
			/>
		</template>
	</USelectMenu>
</template>

<script setup lang="ts">
import type { SelectMenuItem, SelectMenuProps } from "@nuxt/ui";

import { MediaStatus } from "#prisma/enums";

const status = defineModel<MediaStatus | undefined>();

const props = defineProps<{} & Pick<SelectMenuProps, "variant" | "loading" | "disabled">>();

const statuses = computed<SelectMenuItem[]>(() => {
	return Object.values(MediaStatus).map((status) => ({
		value: status,
		label: MOVIE_STATUS_LABELS[status],
		chip: {
			color: STATUS_COLORS[status],
		},
	}));
});
</script>
