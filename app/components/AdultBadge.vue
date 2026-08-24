<template>
	<UBadge :color="color" variant="subtle" :leading-icon="icon" :label="label" />
</template>

<script setup lang="ts">
const props = defineProps<{
	adult?: boolean;
}>();

const label = computed(() => (props.adult ? "+18" : "Safe"));
const icon = computed(() => (props.adult ? "i-lucide-user-x" : "i-lucide-check"));
const color = computed<AppColor>(() => (props.adult ? "error" : "success"));
</script>
