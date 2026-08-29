<template>
	<UButton
		label="Refresh"
		leading-icon="i-lucide-rotate-cw"
		variant="subtle"
		color="neutral"
		@click="emit('click', $event)"
	/>
</template>

<script setup lang="ts">
const emit = defineEmits<{
	click: [event: MouseEvent];
}>();
</script>
