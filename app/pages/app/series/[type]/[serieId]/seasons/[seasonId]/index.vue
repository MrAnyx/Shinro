<template>{{ serieId }} - {{ type }} - {{ seasonId }}</template>

<script setup lang="ts">
definePageMeta({
	validate(route) {
		return (
			typeof route.params.type === "string" &&
			(Object.values(MediaSourceTypes) as string[]).includes(route.params.type)
		);
	},
});

const route = useRoute();

const type = computed(() => route.params.type as MediaSourceType);
const serieId = computed(() => route.params.serieId as string);
const seasonId = computed(() => route.params.seasonId as string);
</script>
