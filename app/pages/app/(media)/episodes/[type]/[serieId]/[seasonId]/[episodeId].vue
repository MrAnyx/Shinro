<template>
	<UEmpty
		v-if="notFound"
		title="Episode not found"
		description="This episode is not available."
		icon="i-lucide-search-x"
	/>
	<UAlert v-else-if="error" color="error" title="Failed to open episode details">
		<template #actions><UButton label="Retry" color="error" variant="subtle" @click="refresh()" /></template>
	</UAlert>
	<USkeleton v-else class="w-full h-12 rounded-sm" />
</template>

<script setup lang="ts">
definePageMeta({
	validate(route) {
		const { type, seasonId, episodeId } = route.params;
		return (
			typeof type === "string" &&
			(Object.values(MediaSourceTypes) as string[]).includes(type) &&
			typeof seasonId === "string" &&
			typeof episodeId === "string" &&
			(type === MediaSourceTypes.internal || (/^\d+$/.test(seasonId) && /^\d+$/.test(episodeId)))
		);
	},
});

const route = useRoute();
const trpc = useTrpc();
const notFound = ref(false);
const { error, refresh } = useClientAsyncData(
	async () => {
		const path = route.fullPath;
		const type = String(route.params.type);
		let destination: string;
		if (type === MediaSourceTypes.external) {
			destination = episodeDetailsPath(
				String(route.params.serieId),
				Number(route.params.seasonId),
				Number(route.params.episodeId),
			);
		} else {
			const details = await trpc.episode.getInternalDetails.query({ id: String(route.params.episodeId) });
			const { episode } = details;
			if (!episode) {
				throw new Error("Saved episode is unavailable");
			}
			destination = episodeDetailsPath(episode.season.serieId, episode.season.number, episode.number);
		}
		if (route.fullPath === path) {
			await navigateTo(destination, { replace: true });
		}
		return true;
	},
	{
		watch: [() => route.fullPath],
		onError: (err) => {
			notFound.value = getTRPCErrorCode(err) === "NOT_FOUND";
		},
	},
);
watch(
	() => route.fullPath,
	() => {
		notFound.value = false;
	},
);
</script>
