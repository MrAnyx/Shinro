<template>
	<div class="flex items-center gap-x-2">
		<UInputRating
			v-model="rating"
			:step="0.5"
			:length="10"
			empty-icon="i-ph-star"
			icon="i-ph-star-fill"
			color="success"
		/>
		<UButton label="Clear" color="error" variant="link" class="p-0!" @click="clearRating" />
	</div>
</template>

<script setup lang="ts">
const rating = defineModel<number | undefined>();

const emit = defineEmits<{
	(event: "clear"): void;
}>();

function clearRating() {
	rating.value = undefined;
	emit("clear");
}
</script>
