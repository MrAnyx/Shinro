<template>{{ data?.name }}</template>

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
const trpc = useTrpc();

const type = computed(() => route.params.type as MediaSourceType);
const serieId = computed(() => route.params.serieId as string);
const seasonId = computed(() => route.params.seasonId as string);

const { data, pending } = useClientAsyncData(
	() => trpc.tmdbSeason.details.query({ serieId: serieId.value, seasonNumber: seasonId.value }),
	{
		ignoreError: (err) => getTRPCErrorCode(err) === "NOT_FOUND",
	},
);
</script>
