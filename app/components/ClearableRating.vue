<template>
	<div class="flex items-center gap-x-2">
		<UInputRating
			v-model="rating"
			:step="0.5"
			:length="10"
			empty-icon="i-ph-star"
			icon="i-ph-star-fill"
			color="success"
			:disabled="props.loading"
		/>
		<UButton
			label="Clear"
			color="error"
			variant="link"
			class="p-0!"
			@click="clearRating"
			:loading="props.loading"
		/>
	</div>
</template>

<script setup lang="ts">
const rating = defineModel<number | undefined>();

const props = defineProps<{
	loading?: boolean;
}>();

function clearRating() {
	rating.value = undefined;
}
</script>
