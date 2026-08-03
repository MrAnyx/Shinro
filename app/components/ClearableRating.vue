<template>
	<div class="flex items-center gap-x-2">
		<UInputRating
			v-model="rating"
			:step="0.5"
			:length="10"
			empty-icon="i-ph-star"
			icon="i-ph-star-fill"
			color="success"
		/>
		<UButton label="Clear" color="error" variant="link" class="p-0!" @click="clearRating" />
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{
	modelValue?: number | null;
}>();

const emit = defineEmits<{
	(event: "update:modelValue", value: number | null): void;
	(event: "clear"): void;
}>();

const rating = computed<number | undefined>({
	get: () => props.modelValue ?? undefined,
	set: (value) => emit("update:modelValue", value ?? null),
});

const clearRating = () => {
	emit("update:modelValue", null);
	emit("clear");
};
</script>
