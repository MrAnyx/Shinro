<template>
	<UPopover :ui="{ content: 'p-3!' }">
		<UButton
			:color="props.color"
			:variant="props.variant"
			:loading="props.loading"
			:disabled="props.loading || props.disabled"
			block
			:label="ratingButtonLabel"
			leading-icon="i-lucide-user-star"
		/>

		<template #content>
			<ClearableRating
				v-model="rating"
				:loading="props.loading || props.popupLoading"
				:disabled="props.disabled || props.popupDisabled"
			/>
		</template>
	</UPopover>
</template>

<script setup lang="ts">
import type { ButtonProps } from "@nuxt/ui";

const rating = defineModel<number>();

const props = defineProps<
	{
		popupLoading?: boolean;
		popupDisabled?: boolean;
	} & Pick<ButtonProps, "loading" | "disabled" | "variant" | "color">
>();

const ratingButtonLabel = computed(() =>
	rating.value
		? `Edit my rating (${rating.value.toLocaleString(undefined, { maximumFractionDigits: 1 })})`
		: `Set a rating`,
);
</script>
