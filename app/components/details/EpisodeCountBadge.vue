<template>
	<UBadge color="neutral" variant="subtle" leading-icon="i-lucide-list-video"> {{ label }} </UBadge>
</template>

<script setup lang="ts">
const props = defineProps<{
	count?: number;
}>();

const internalCount = computed(() => props.count ?? 0);
const label = computed(() =>
	internalCount.value > 0
		? `${internalCount.value} ${internalCount.value > 1 ? "episodes" : "episode"}`
		: "No episode",
);
</script>
