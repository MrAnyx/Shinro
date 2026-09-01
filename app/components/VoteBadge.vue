<template>
	<UBadge :color="color" variant="subtle" :leading-icon="icon" :label="label" />
</template>

<script setup lang="ts">
const props = defineProps<{
	score?: number;
	count?: number;
	minScore?: number;
	maxScore?: number;
}>();

const count = computed(() => {
	if (props.count === undefined) {
		return undefined;
	}

	return Math.max(0, props.count);
});

const score = computed(() => {
	if (props.score === undefined) {
		return count.value === undefined || count.value === 0 ? undefined : 0;
	}

	return Math.max(minScore.value, Math.min(props.score, maxScore.value));
});

const hasVotes = computed(() => {
	if (count.value !== undefined) {
		return count.value > 0;
	}
	return props.score !== undefined;
});
const icon = computed(() => (hasVotes.value ? "i-lucide-star" : undefined));
const minScore = computed(() => props.minScore ?? 0);
const maxScore = computed(() => props.maxScore ?? 10);
const minThreshold = computed(() => minScore.value + (maxScore.value - minScore.value) * (1 / 3));
const maxThreshold = computed(() => minScore.value + (maxScore.value - minScore.value) * (2 / 3));

const label = computed(() => {
	if (!hasVotes.value) {
		return "No votes";
	}

	const scoreLabel =
		score.value?.toLocaleString(undefined, { maximumFractionDigits: 1 }) ??
		minScore.value.toLocaleString(undefined, { maximumFractionDigits: 1 });

	const countLabel = count.value ? ` (${count.value.toLocaleString()} votes)` : "";

	return `${scoreLabel}${countLabel}`.trim();
});

const color = computed<AppColor>(() => {
	if (!hasVotes.value) {
		return "neutral";
	}

	if (score.value! >= maxThreshold.value) {
		return "success";
	} else if (score.value! >= minThreshold.value) {
		return "warning";
	} else {
		return "error";
	}
});
</script>
