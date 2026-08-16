<template>
	<UBadge :color="color" v-if="props.status" :variant="props.variant">
		{{ label }}
	</UBadge>
</template>

<script setup lang="ts">
import type { BadgeProps } from "@nuxt/ui";

import type { MediaStatus, MediaType } from "#prisma/enums";

const props = defineProps<
	{
		status: MediaStatus;
		type: MediaType;
	} & Pick<BadgeProps, "variant">
>();

const label = computed(() => STATUS_LABELS[props.type][props.status]);
const color = computed(() => STATUS_COLORS[props.status]);
</script>
