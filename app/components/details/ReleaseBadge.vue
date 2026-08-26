<!-- components/ReleaseBadge.vue -->
<template>
	<UBadge :color="badge.color" variant="subtle" :leading-icon="badge.icon">
		{{ badge.label }}
	</UBadge>
</template>

<script setup lang="ts">
const props = defineProps<{
	startDate?: Date | string;
	endDate?: Date | string;
}>();

type BadgeState = "unknown" | "upcoming" | "ongoing" | "released";

const badge = computed(() => {
	const now = new Date();

	let state: BadgeState;

	if (!props.startDate) {
		state = "unknown";
	} else if (now < new Date(props.startDate)) {
		state = "upcoming";
	} else if (props.endDate && now <= new Date(props.endDate)) {
		state = "ongoing";
	} else {
		state = "released";
	}

	const config: Record<BadgeState, { color: AppColor; icon: string; label: string }> = {
		unknown: { color: "neutral", icon: "i-lucide-circle-help", label: "Unknown" },
		upcoming: { color: "warning", icon: "i-lucide-clock", label: "Upcoming" },
		ongoing: { color: "info", icon: "i-lucide-loader", label: "Ongoing" },
		released: { color: "success", icon: "i-lucide-check", label: "Released" },
	};

	return config[state];
});
</script>
