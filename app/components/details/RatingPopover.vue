<template>
	<UPopover :ui="{ content: 'p-3!' }">
		<UButton color="neutral" variant="subtle" block :label="ratingButtonLabel" leading-icon="i-lucide-user-star" />

		<template #content>
			<ClearableRating v-model="rating" />
		</template>
	</UPopover>
</template>

<script setup lang="ts">
const rating = defineModel<number | undefined>();

const ratingButtonLabel = computed(() =>
	rating.value
		? `Edit my rating (${rating.value.toLocaleString(undefined, { maximumFractionDigits: 1 })})`
		: `Set a rating`,
);
</script>
