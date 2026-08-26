<template>
	<UBadge color="neutral" variant="subtle" leading-icon="i-lucide-clock" :label="internalLabel" />
</template>

<script setup lang="ts">
const props = defineProps<{
	duration?: number;
}>();

const internalLabel = computed(() => {
	if (props.duration === undefined) {
		return "No duration";
	}

	const hours = Math.floor(props.duration / 60)
		.toString()
		.padStart(2, "0");

	const minutes = (props.duration % 60).toString().padStart(2, "0");

	return `${hours}:${minutes}`;
});
</script>
