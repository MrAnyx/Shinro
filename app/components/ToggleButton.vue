<template>
	<UButton
		:variant="props.variant"
		:disabled="props.disabled"
		:size="props.size"
		:icon="icon"
		:color="color"
		:loading="loading"
		@click="handleClick"
	/>
</template>

<script setup lang="ts">
import type { ButtonProps } from "@nuxt/ui";

const props = defineProps<
	{
		isAdded?: boolean;
		onAdd?: () => Promise<void> | void;
		onRemove?: () => Promise<void> | void;
	} & Pick<ButtonProps, "disabled" | "variant" | "size">
>();

const loading = ref(false);
const isAdded = ref(props.isAdded ?? false);

const icon = computed(() => (isAdded.value ? "i-lucide-circle-minus" : "i-lucide-circle-plus"));
const color = computed(() => (isAdded.value ? "error" : "neutral"));

const handleClick = async () => {
	try {
		loading.value = true;
		if (isAdded.value) {
			await props.onRemove?.();
		} else {
			await props.onAdd?.();
		}

		isAdded.value = !isAdded.value;
	} finally {
		loading.value = false;
	}
};
</script>
