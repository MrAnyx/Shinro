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
		onClickOn?: () => Promise<void> | void;
		onClickOff?: () => Promise<void> | void;
		onIcon?: string;
		offIcon?: string;
		onColor?: AppColor;
		offColor?: AppColor;
	} & Pick<ButtonProps, "disabled" | "variant" | "size">
>();

const isAdded = computed(() => !!props.isAdded);

const loading = ref(false);

const icon = computed(() =>
	isAdded.value ? (props.onIcon ?? "i-lucide-circle-minus") : (props.offIcon ?? "i-lucide-circle-plus"),
);
const color = computed(() => (isAdded.value ? (props.onColor ?? "error") : (props.offColor ?? "neutral")));

const handleClick = async () => {
	try {
		loading.value = true;
		if (isAdded.value) {
			await props.onClickOff?.();
		} else {
			await props.onClickOn?.();
		}
	} finally {
		loading.value = false;
	}
};
</script>
