<template>
	<UAlert
		title="Personal note"
		:description="props.description"
		icon="i-lucide-notebook-pen"
		color="neutral"
		variant="subtle"
	/>
</template>
<script setup lang="ts">
const props = defineProps<{
	description: string;
}>();
</script>
