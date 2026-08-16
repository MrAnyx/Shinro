<template>
	<UBadge variant="subtle" :color="STATUS_COLORS[props.status]" v-if="props.status">
		{{ labels[props.status] }}
	</UBadge>
</template>

<script setup lang="ts">
import type { MediaStatus, MediaType } from "#prisma/enums";

const props = defineProps<{
	status: MediaStatus;
	type: MediaType;
}>();

const labels = computed(() => {
	switch (props.type) {
		case "MOVIE":
			return MOVIE_STATUS_LABELS;
		case "SERIE":
		case "SEASON":
		case "EPISODE":
			return SERIE_STATUS_LABELS;
		case "MUSIC":
			return MUSIC_STATUS_LABELS;
		case "BOOK":
			return BOOK_STATUS_LABELS;
		case "GAME":
			return GAME_STATUS_LABELS;
		default:
			throw new Error(`Media type "${props.type}" is not supported`);
	}
});
</script>
