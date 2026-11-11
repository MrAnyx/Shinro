<template>
	<UEmpty
		v-if="notFound"
		title="Episode not found"
		description="This episode is not available."
		icon="i-lucide-search-x"
	/>
	<UAlert v-else-if="error" color="error" title="Failed to fetch episode details">
		<template #actions><UButton label="Retry" color="error" variant="subtle" @click="refresh()" /></template>
	</UAlert>
	<div v-else class="flex flex-col lg:flex-row gap-8 w-full">
		<aside class="w-full lg:w-80 shrink-0">
			<UCard :ui="{ body: 'flex flex-col gap-y-4' }" variant="subtle">
				<ImageFallback
					provider="tmdb"
					:src="episode?.media.imagePath ?? data?.details.imagePath ?? undefined"
					:height="220"
					class="rounded-md"
					:loading="pending"
				/>
				<USkeleton v-if="pending" class="w-full h-[32px] rounded-sm" />
				<template v-else-if="data">
					<template v-if="episode">
						<UButton
							label="Remove from My List"
							block
							leading-icon="i-lucide-trash"
							variant="subtle"
							color="error"
							:loading="isRemoving"
							@click="removeEpisode"
						/>
						<StatusSelectMenu
							v-model="status"
							variant="subtle"
							:type="MediaType.EPISODE"
							:loading="isUpdatingStatus"
						/>
						<CollectionSelectMenu
							v-model="selectedCollectionIds"
							variant="subtle"
							:loading="isUpdatingCollections"
							:disabled="!collections"
						/>
						<DetailsRatingPopover v-model="rating" variant="subtle" color="neutral" />
					</template>
					<UButton
						v-else-if="isExternal"
						label="Add to My List"
						block
						leading-icon="i-lucide-plus"
						variant="subtle"
						color="success"
						:loading="isAdding"
						@click="addEpisode"
					/>
				</template>
			</UCard>
		</aside>
		<main class="flex-1 min-w-0 flex flex-col gap-y-6">
			<UBreadcrumb
				v-if="data"
				color="neutral"
				:items="[
					{ label: data.serieName ?? 'Series', to: serieUrl },
					{ label: data.seasonName ?? 'Season', to: seasonUrl },
					{ label: episode?.media.name ?? data.details.name ?? `Episode ${episodeNumber}`, active: true },
				]"
			/>
			<DetailsTitleHeader
				:loading="pending"
				:title="episode?.media.name ?? data?.details.name ?? `Episode ${episodeNumber}`"
			/>
			<div v-if="data" class="flex flex-wrap gap-2 items-center">
				<DetailsDurationBadge v-if="data.details.runtime != null" :duration="data.details.runtime" />
				<DetailsDateBadge v-if="data.details.airDate" :date="data.details.airDate" />
				<DetailsReleaseBadge :start-date="data.details.airDate ?? undefined" />
				<VoteBadge v-if="data.details.voteAverage != null" :score="data.details.voteAverage" />
			</div>
			<DetailsOverview :loading="pending" :overview="episode?.overview ?? data?.details.overview ?? undefined" />
			<DetailsPersonalNote v-if="episode?.media.note && !pending" :description="episode.media.note" />
		</main>
	</div>
</template>

<script setup lang="ts">
import { useDebounceFn } from "@vueuse/core";
import { z } from "zod";

import { MediaStatus, MediaType } from "#prisma/enums";

definePageMeta({
	validate(route) {
		const { serieId, seasonNumber, episodeNumber } = route.params;
		return (
			typeof serieId === "string" &&
			(/^\d+$/.test(serieId) || z.uuid().safeParse(serieId).success) &&
			typeof seasonNumber === "string" &&
			typeof episodeNumber === "string" &&
			/^\d+$/.test(seasonNumber) &&
			/^\d+$/.test(episodeNumber) &&
			Number(seasonNumber) <= 2147483647 &&
			Number(episodeNumber) <= 2147483647
		);
	},
});

const route = useRoute();
const trpc = useTrpc();
const toast = useStatusToast();
const serieStore = useSerieStore();
const seasonStore = useSeasonStore();
const episodeStore = useEpisodeStore();
const { openConfirmationModal } = useConfirmation();
const serieId = computed(() => String(route.params.serieId));
const isExternal = computed(() => /^\d+$/.test(serieId.value));
const seasonNumber = computed(() => String(route.params.seasonNumber));
const routeEpisodeNumber = computed(() => String(route.params.episodeNumber));
const externalInput = () => ({
	externalSerieId: serieId.value,
	seasonNumber: Number(seasonNumber.value),
	episodeNumber: Number(routeEpisodeNumber.value),
});
const notFound = ref(false);
watch([serieId, seasonNumber, routeEpisodeNumber], () => {
	notFound.value = false;
});
const { data, pending, error, refresh } = useClientAsyncData(
	() =>
		isExternal.value
			? trpc.episode.getExternalDetails.query(externalInput())
			: trpc.episode.getInternalDetails.query({
					serieId: serieId.value,
					seasonNumber: Number(seasonNumber.value),
					episodeNumber: Number(routeEpisodeNumber.value),
				}),
	{
		watch: [serieId, seasonNumber, routeEpisodeNumber],
		onError: (err) => {
			if (getTRPCErrorCode(err) === "NOT_FOUND") {
				notFound.value = true;
			} else {
				toast.error(err, { description: "Failed to fetch episode details" });
			}
		},
	},
);
const episode = computed(() => data.value?.episode ?? null);
const savedId = computed(() => episode.value?.id);
const episodeNumber = computed(() => data.value?.details.number ?? routeEpisodeNumber.value);
const seasonUrl = computed(() =>
	isExternal.value
		? `/app/series/external/${serieId.value}/seasons/${seasonNumber.value}`
		: `/app/series/internal/${episode.value?.season.serieId}/seasons/${episode.value?.seasonId}`,
);
const serieUrl = computed(() =>
	isExternal.value
		? `/app/series/external/${serieId.value}`
		: `/app/series/internal/${episode.value?.season.serieId}`,
);
const { data: collections } = useClientAsyncData(
	() => (savedId.value ? trpc.media.getCollections.query({ type: "id", id: savedId.value }) : Promise.resolve(null)),
	{ watch: [savedId], defaultErrorMessage: "Failed to fetch collections" },
);
const { loading: isAdding, execute: addEpisode } = useLoadingWrapper(() =>
	toast.withErrorToast(async () => {
		if (!data.value || episode.value || !isExternal.value) {
			return;
		}
		const path = route.fullPath;
		const saved = await episodeStore.createEpisodeFromExternal(externalInput());
		if (route.fullPath === path && data.value) {
			data.value = { ...data.value, episode: saved };
		}
		try {
			await Promise.all([serieStore.initialize(), seasonStore.initialize()]);
		} catch (err) {
			toast.error(err, { description: "Episode added, but parent counts could not be refreshed" });
		}
	}),
);
const { loading: isRemoving, execute: removeEpisode } = useLoadingWrapper(() =>
	toast.withErrorToast(async () => {
		const id = savedId.value;
		if (!id) {
			return;
		}
		const confirmed = await openConfirmationModal(() => episodeStore.deleteEpisode({ id }), {
			title: "Delete this episode",
			message: "Press confirm to remove this episode from My List.",
			icon: "i-lucide-trash",
		});
		if (!confirmed || savedId.value !== id) {
			return;
		}
		if (isExternal.value && data.value) {
			data.value = { ...data.value, episode: null };
		} else {
			await navigateTo("/app/episodes");
		}
	}),
);
const setEpisode = (updated: EpisodeWithParents) => {
	if (data.value && savedId.value === updated.id) {
		data.value = { ...data.value, episode: updated };
	}
};
const pendingStatus = usePendingValue<MediaStatus>();
const status = computed({
	get: () => (pendingStatus.isPending ? pendingStatus.value : (episode.value?.media.status ?? undefined)),
	set: (value) => pendingStatus.track(value, updateStatus),
});
const { loading: isUpdatingStatus, execute: updateStatus } = useLoadingWrapper((value: MediaStatus | undefined) =>
	toast.withErrorToast(async () => {
		if (savedId.value) {
			setEpisode(await trpc.episode.update.mutate({ id: savedId.value, status: value ?? null }));
		}
	}),
);
const pendingRating = usePendingValue<number>();
const rating = computed({
	get: () => (pendingRating.isPending ? pendingRating.value : (episode.value?.media.rating ?? undefined)),
	set: (value) => pendingRating.track(value, updateRating),
});
const updateRating = useDebounceFn(
	(value: number | undefined) =>
		toast.withErrorToast(async () => {
			if (savedId.value) {
				setEpisode(await trpc.episode.update.mutate({ id: savedId.value, rating: value ?? null }));
			}
		}),
	DEBOUNCE_TIMER,
);
const pendingCollections = usePendingValue<string[]>();
const selectedCollectionIds = computed({
	get: () =>
		pendingCollections.isPending
			? pendingCollections.value!
			: (collections.value?.map((collection) => collection.id) ?? []),
	set: (value) => pendingCollections.track(value, updateCollections),
});
const { loading: isUpdatingCollections, execute: updateCollections } = useLoadingWrapper((collectionIds: string[]) =>
	toast.withErrorToast(async () => {
		if (savedId.value) {
			collections.value = await trpc.media.updateCollections.mutate({ id: savedId.value, collectionIds });
		}
	}),
);
</script>
