import { useIntervalFn } from "@vueuse/core";

export const useTimeGreeting = () => {
	const now = ref(new Date());

	useIntervalFn(() => {
		now.value = new Date();
	}, 60_000);

	const timeOfDay = computed<TimeOfDay>(() => {
		const hour = now.value.getHours();
		if (hour >= 5 && hour < 12) {
			return "morning";
		}
		if (hour >= 12 && hour < 18) {
			return "afternoon";
		}
		return "evening";
	});

	const greeting = computed(() => {
		const map: Record<TimeOfDay, string> = {
			morning: "Good morning",
			afternoon: "Good afternoon",
			evening: "Good evening",
		};
		return map[timeOfDay.value];
	});

	return { timeOfDay, greeting };
};
