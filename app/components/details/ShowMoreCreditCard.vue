<template>
	<UCard
		class="w-(--details-card-width) shrink-0"
		:ui="{ body: 'p-0! flex justify-center items-center h-full' }"
		variant="subtle"
	>
		<NuxtLink class="flex flex-col gap-y-2 items-center justify-center h-full" :to="props.to" target="_blank">
			<UAvatar icon="i-lucide-external-link" size="xl" color="primary" />
			<span class="text-toned" v-if="props.title">{{ props.title }}</span>
			<span class="text-muted text-xs" v-if="props.subtitle">{{ props.subtitle }}</span>
		</NuxtLink>
	</UCard>
</template>

<script setup lang="ts">
import type { RouteLocationAsRelativeGeneric, RouteLocationAsPathGeneric } from "#vue-router";

const props = defineProps<{
	to?: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric;
	title?: string;
	subtitle?: string;
}>();
</script>
