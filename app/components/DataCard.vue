<template>
	<NuxtLink :to="props.to">
		<UCard :ui="{ body: 'flex gap-x-4 items-center' }">
			<UIcon :name="props.icon" class="h-6 w-6 text-primary" v-if="props.icon" />
			<div class="flex-1">
				<h2 class="">{{ props.title }}</h2>
				<h3 class="text-sm text-muted">{{ props.subtitle }}</h3>
			</div>
			<span class="text-2xl">{{ value }}</span>
		</UCard>
	</NuxtLink>
</template>

<script setup lang="ts">
import type { RouteLocationAsRelativeGeneric, RouteLocationAsPathGeneric } from "#vue-router";

const props = defineProps<{
	icon?: string;
	title: string;
	subtitle: string;
	value: string | number;
	to?: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric;
}>();

const value = computed(() => {
	if (typeof props.value === "string") {
		return props.value;
	}

	return formatNumber(props.value, {
		notation: "compact",
		maximumFractionDigits: 1,
	});
});
</script>
