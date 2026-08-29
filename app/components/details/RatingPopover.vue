<template>
	<UPopover :ui="{ content: 'p-3!' }">
		<UButton
			color="neutral"
			variant="subtle"
			:loading="props.loading"
			block
			:label="ratingButtonLabel"
			leading-icon="i-lucide-user-star"
		/>

		<template #content>
			<ClearableRating v-model="rating" />
		</template>
	</UPopover>
</template>

<script setup lang="ts">
const rating = defineModel<number>();

const props = defineProps<{
	loading?: boolean;
}>();

const ratingButtonLabel = computed(() =>
	rating.value
		? `Edit my rating (${rating.value.toLocaleString(undefined, { maximumFractionDigits: 1 })})`
		: `Set a rating`,
);
</script>
