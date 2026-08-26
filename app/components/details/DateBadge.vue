<template>
	<UBadge color="neutral" variant="subtle" leading-icon="i-lucide-calendar">
		<NuxtTime :datetime="props.date" year="numeric" month="short" day="numeric" v-if="props.date" />
		<span v-else>No date</span>
	</UBadge>
</template>

<script setup lang="ts">
const props = defineProps<{
	date?: string | Date | number;
}>();
</script>
