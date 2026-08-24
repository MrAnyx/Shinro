<template>
	<UBadge :color="color" variant="subtle" :leading-icon="icon" :label="label" />
</template>

<script setup lang="ts">
const props = defineProps<{
	average: number;
	count: number;
}>();

const icon = computed(() => (props.count > 0 ? "i-lucide-star" : undefined));

const label = computed(() =>
	props.count > 0
		? `${props.average.toLocaleString(undefined, { maximumFractionDigits: 1 })} (${props.count.toLocaleString()} votes)`
		: "No votes",
);

const color = computed<AppColor>(() => {
	if (props.count <= 0) {
		return "neutral";
	}

	if (props.average >= 7) {
		return "success";
	} else if (props.average >= 5) {
		return "warning";
	} else {
		return "error";
	}
});
</script>
