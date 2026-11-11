<template>
	<UEmpty
		v-if="notFound"
		title="Season not found"
		description="This season is not available."
		icon="i-lucide-search-x"
	/>
	<UAlert v-else-if="fetchError" color="error" title="Failed to fetch season details">
		<template #actions>
			<UButton label="Retry" color="error" variant="subtle" @click="refreshAll()" />
		</template>
	</UAlert>
	<div v-else class="flex flex-col lg:flex-row gap-8 w-full">
		<aside class="w-full lg:w-80 shrink-0">
			<UCard :ui="{ body: 'flex flex-col gap-y-4' }" variant="subtle">
				<ImageFallback
					provider="tmdb"
					:src="view?.imagePath ?? undefined"
					:height="400"
					class="rounded-md"
					:loading="pending"
				/>
				<template v-if="pending">
					<USkeleton class="w-full h-[32px] rounded-sm" />
					<USkeleton class="w-full h-[32px] rounded-sm" />
				</template>
				<template v-else-if="view">
					<template v-if="season">
						<UButton
							label="Remove from My List"
							block
							leading-icon="i-lucide-trash"
							variant="subtle"
							color="error"
							:loading="isRemoving"
							@click="removeSeason"
						/>
						<UButton
							label="Edit the season"
							block
							leading-icon="i-lucide-square-pen"
							variant="subtle"
							color="info"
							:loading="isEditing"
							@click="editSeason"
						/>
						<StatusSelectMenu
							v-model="status"
							variant="subtle"
							:type="MediaType.SEASON"
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
						v-else
						label="Add to My List"
						block
						leading-icon="i-lucide-plus"
						variant="subtle"
						:loading="isAdding"
						@click="addSeason"
					/>
				</template>
			</UCard>
		</aside>
		<main class="flex-1 min-w-0 flex flex-col gap-y-6">
			<DetailsTitleHeader :loading="pending" :title="view?.name" />
			<div v-if="view" class="flex gap-2 flex-wrap items-center">
				<UBadge v-if="episodes" color="neutral" variant="subtle" icon="i-lucide-list-video">
					{{ episodes.length }} {{ episodes.length === 1 ? "episode" : "episodes" }}
				</UBadge>
				<UButton
					:to="`/app/series/${sourceType}/${routeSerieId}`"
					:label="view.serieName ?? 'Series'"
					variant="link"
					icon="i-lucide-tv-minimal-play"
				/>
			</div>
			<DetailsOverview :loading="pending" :overview="view?.overview ?? undefined" />
			<DetailsPersonalNote v-if="season?.media.note && !pending" :description="season.media.note" />
			<UTabs v-if="view" :items="tabs" variant="link">
				<template #credits>
					<UAlert v-if="creditsError" color="error" title="Failed to fetch credits">
						<template #actions>
							<UButton label="Retry" color="error" variant="subtle" @click="refreshCredits()" />
						</template>
					</UAlert>
					<DetailsCreditCards
						v-else
						:credits="credits"
						image-provider="tmdb"
						:loading="loadingCredits"
						:show-more-to="castUrl"
						:credit-card-to-fn="(credit: TmdbCredit) => `https://www.themoviedb.org/person/${credit.id}`"
					/>
				</template>
				<template #episodes>
					<UAlert v-if="episodesError" color="error" title="Failed to fetch episodes">
						<template #actions>
							<UButton label="Retry" color="error" variant="subtle" @click="refreshEpisodes()" />
						</template>
					</UAlert>
					<div v-else class="flex flex-col gap-4">
						<UAlert
							v-if="!season"
							color="info"
							variant="subtle"
							title="Add this season to My List to edit episode statuses"
						/>
						<UCard :ui="{ body: 'p-0! h-full' }" class="h-full">
							<UTable :data="episodes" :columns="episodeColumns" :loading="loadingEpisodes">
								<template #empty>
									<UEmpty title="No episodes found" variant="naked" icon="i-lucide-ban" />
								</template>
								<template #image-cell="{ row }">
									<ImageFallback
										:width="100"
										:height="56"
										class="rounded-sm"
										provider="tmdb"
										:src="row.original.imagePath"
									/>
								</template>
								<template #date-cell="{ row }">
									<NuxtTime
										v-if="row.original.airDate"
										:datetime="row.original.airDate"
										year="numeric"
										month="short"
										day="numeric"
										timezone="UTC"
									/>
								</template>
								<template #duration-cell="{ row }">
									<DetailsDurationBadge :duration="row.original.runtime ?? undefined" />
								</template>
								<template #vote-cell="{ row }">
									<VoteBadge :score="row.original.voteAverage ?? undefined" />
								</template>
								<template #status-cell="{ row }">
									<StatusSelectMenu
										:model-value="episodeStatus(row.original)"
										:type="MediaType.EPISODE"
										class="w-full"
										variant="subtle"
										:aria-label="`Status for ${row.original.name ?? `episode ${row.original.number}`}`"
										:disabled="!season"
										:loading="pendingEpisodeStatuses.has(row.original.number)"
										@update:model-value="updateEpisodeStatus(row.original.number, $event)"
									/>
								</template>
							</UTable>
						</UCard>
					</div>
				</template>
			</UTabs>
		</main>
	</div>
</template>

<script setup lang="ts">
import type { TableColumn, TabsItem } from "@nuxt/ui";
import { useDebounceFn } from "@vueuse/core";

import { LazySeasonFormModal } from "#components";
import { MediaStatus, MediaType } from "#prisma/enums";
import type { TmdbCredit } from "~/types/tmdb";

definePageMeta({
	validate(route) {
		const { type, seasonId } = route.params;
		if (typeof type !== "string" || !(Object.values(MediaSourceTypes) as string[]).includes(type)) {
			return false;
		}
		return type === MediaSourceTypes.internal || Number.isInteger(Number(seasonId));
	},
});

const route = useRoute();
const trpc = useTrpc();
const toast = useStatusToast();
const seasonStore = useSeasonStore();
const seasonFormModal = useOverlay().create(LazySeasonFormModal);
const { openConfirmationModal } = useConfirmation();

// `type` is "internal" (saved series/season ids) or "external" (TMDB series id and season number)
const sourceType = computed(() => route.params.type as MediaSourceType);
const routeSerieId = computed(() => route.params.serieId as string);
const routeSeasonId = computed(() => route.params.seasonId as string);
const isExternal = computed(() => sourceType.value === MediaSourceTypes.external);
const notFound = ref(false);
watch([sourceType, routeSerieId, routeSeasonId], () => {
	notFound.value = false;
});
const handleLoadError = (error: unknown) => {
	if (getTRPCErrorCode(error) === "NOT_FOUND") {
		notFound.value = true;
	} else {
		toast.error(error, { description: "Failed to fetch season details" });
	}
};

const {
	data: internalData,
	pending: pendingInternal,
	error: internalError,
	refresh: refreshInternal,
} = useClientAsyncData(
	async () => (isExternal.value ? null : await trpc.season.getById.query({ id: routeSeasonId.value })),
	{ watch: [sourceType, routeSerieId, routeSeasonId], onError: handleLoadError },
);
const {
	data: externalData,
	pending: pendingExternal,
	error: externalError,
	refresh: refreshExternal,
} = useClientAsyncData(
	async () =>
		isExternal.value
			? await trpc.season.getExternalDetails.query({
					externalSerieId: routeSerieId.value,
					seasonNumber: Number(routeSeasonId.value),
				})
			: null,
	{ watch: [sourceType, routeSerieId, routeSeasonId], onError: handleLoadError },
);
const pending = computed(() => pendingInternal.value || pendingExternal.value);
const fetchError = computed(() => !notFound.value && (internalError.value || externalError.value));
const refreshAll = () => Promise.all([refreshInternal(), refreshExternal()]);

// Saved season (if any), whichever way the page was reached
const season = computed(() => (isExternal.value ? externalData.value?.internalSeason : internalData.value) ?? null);
const id = computed(() => season.value?.id);

const view = computed(() => {
	if (isExternal.value) {
		const details = externalData.value;
		if (!details) {
			return null;
		}
		return {
			name: season.value?.media.name ?? details.season.name ?? `Season ${details.season.season_number}`,
			imagePath: season.value?.media.imagePath ?? details.season.poster_path,
			overview: season.value?.overview ?? details.season.overview,
			number: details.season.season_number,
			serieName: details.serie.name,
			serieExternalId: String(details.serie.id),
		};
	}
	const saved = internalData.value;
	if (!saved) {
		return null;
	}
	return {
		name: saved.media.name ?? `Season ${saved.number}`,
		imagePath: saved.media.imagePath,
		overview: saved.overview,
		number: saved.number,
		serieName: saved.serie.media.name,
		serieExternalId: saved.serie.media.externalId,
	};
});

const castUrl = computed(() =>
	view.value?.serieExternalId
		? `https://www.themoviedb.org/tv/${view.value.serieExternalId}/season/${view.value.number}/cast`
		: undefined,
);

const { data: collections } = useClientAsyncData(
	async () => (id.value ? await trpc.media.getCollections.query({ type: "id", id: id.value }) : null),
	{ watch: [id], defaultErrorMessage: "Failed to fetch collections" },
);

const tabs: TabsItem[] = [
	{ icon: "i-lucide-users", label: "Credits", slot: "credits" },
	{ icon: "i-lucide-list-video", label: "Episodes", slot: "episodes" },
];
const episodeColumns: TableColumn<SeasonEpisode>[] = [
	{ id: "image", meta: { class: { td: "w-[100px]" } } },
	{
		accessorKey: "number",
		header: "#",
		meta: { class: { th: "w-0 whitespace-nowrap", td: "w-0 whitespace-nowrap" } },
	},
	{
		id: "title",
		header: "Title",
		cell: ({ row }) => row.original.name ?? `Episode ${row.original.number}`,
		meta: { class: { td: "max-w-[120px] truncate font-bold text-default" } },
	},
	{ accessorKey: "overview", header: "Overview", meta: { class: { td: "max-w-[300px] truncate" } } },
	{
		id: "date",
		header: "Released At",
		meta: { class: { th: "w-0 whitespace-nowrap", td: "w-0 whitespace-nowrap" } },
	},
	{
		id: "duration",
		header: "Duration",
		meta: { class: { th: "w-0 whitespace-nowrap", td: "w-0 whitespace-nowrap" } },
	},
	{ id: "vote", header: "Vote", meta: { class: { th: "w-0 whitespace-nowrap", td: "w-0 whitespace-nowrap" } } },
	{ id: "status", header: "Status", meta: { class: { th: "w-0 whitespace-nowrap", td: "w-0 whitespace-nowrap" } } },
];

const {
	data: internalEpisodes,
	pending: loadingInternalEpisodes,
	error: internalEpisodesError,
	refresh: refreshInternalEpisodes,
	clear: clearInternalEpisodes,
} = useClientAsyncData(() => trpc.season.getEpisodes.query({ id: id.value! }), {
	immediate: false,
	onError: () => {},
});
const {
	data: internalCredits,
	pending: loadingInternalCredits,
	error: internalCreditsError,
	refresh: refreshInternalCredits,
	clear: clearInternalCredits,
} = useClientAsyncData(() => trpc.season.getCredits.query({ id: routeSeasonId.value }), {
	immediate: false,
	onError: () => {},
});
watch(
	[id, sourceType, routeSerieId, routeSeasonId],
	([seasonId, type, serieId, seasonRouteId]) => {
		clearInternalEpisodes();
		clearInternalCredits();
		const matchesRoute =
			type === MediaSourceTypes.internal
				? seasonId === seasonRouteId
				: season.value?.serie.media.externalId === serieId && season.value.number === Number(seasonRouteId);
		if (seasonId && matchesRoute) {
			refreshInternalEpisodes();
			if (type === MediaSourceTypes.internal) {
				refreshInternalCredits();
			}
		}
	},
	{ immediate: true },
);
const episodes = computed(() => (id.value ? internalEpisodes.value : externalData.value?.episodes));
const credits = computed(() => (isExternal.value ? externalData.value?.credits : internalCredits.value));
const loadingEpisodes = computed(() => (id.value ? loadingInternalEpisodes.value : pendingExternal.value));
const loadingCredits = computed(() => (isExternal.value ? pendingExternal.value : loadingInternalCredits.value));
const episodesError = computed(() => (id.value ? internalEpisodesError.value : null));
const creditsError = computed(() => (isExternal.value ? null : internalCreditsError.value));
const refreshEpisodes = () => refreshInternalEpisodes();
const refreshCredits = () => refreshInternalCredits();

const pendingEpisodeStatuses = reactive(new Map<number, MediaStatus | undefined>());
watch([id, sourceType, routeSerieId, routeSeasonId], () => pendingEpisodeStatuses.clear());
const episodeStatus = (episode: SeasonEpisode) =>
	pendingEpisodeStatuses.has(episode.number)
		? pendingEpisodeStatuses.get(episode.number)
		: (episode.status ?? undefined);
const updateEpisodeStatus = async (number: number, status: MediaStatus | undefined) => {
	const seasonId = id.value;
	if (!seasonId || pendingEpisodeStatuses.has(number)) {
		return;
	}
	pendingEpisodeStatuses.set(number, status);
	try {
		await trpc.season.updateEpisodeStatus.mutate({ seasonId, number, status: status ?? null });
		if (id.value === seasonId && internalEpisodes.value) {
			const episode = internalEpisodes.value.find((item) => item.number === number);
			if (episode) {
				episode.status = status ?? null;
			}
		}
	} catch (error) {
		toast.error(error, { description: "Failed to update episode status" });
	} finally {
		if (id.value === seasonId) {
			pendingEpisodeStatuses.delete(number);
		}
	}
};

const setSeason = (updated: Season) => {
	if (isExternal.value && externalData.value?.internalSeason) {
		externalData.value = {
			...externalData.value,
			internalSeason: { ...externalData.value.internalSeason, ...updated },
		};
	} else if (internalData.value) {
		internalData.value = { ...internalData.value, ...updated };
	}
};

const { loading: isAdding, execute: addSeason } = useLoadingWrapper(() =>
	toast.withErrorToast(async () => {
		if (!externalData.value || season.value) {
			return;
		}
		const result = await seasonStore.createSeasonFromExternal({
			externalSerieId: routeSerieId.value,
			seasonNumber: Number(routeSeasonId.value),
		});
		externalData.value = {
			...externalData.value,
			internalSeason: { ...result.season, serie: result.serie },
		};
	}),
);
const { loading: isRemoving, execute: removeSeason } = useLoadingWrapper(() =>
	toast.withErrorToast(async () => {
		const seasonId = id.value;
		if (!seasonId) {
			return;
		}
		const result = await openConfirmationModal(() => seasonStore.deleteSeason({ id: seasonId }), {
			title: "Delete this season",
			message: "This also deletes its saved episodes. Press confirm to proceed.",
			icon: "i-lucide-trash",
		});
		if (!result) {
			return;
		}
		if (isExternal.value && externalData.value) {
			externalData.value = { ...externalData.value, internalSeason: null };
			collections.value = null;
		} else {
			await navigateTo("/app/seasons");
		}
	}),
);
const { loading: isEditing, execute: editSeason } = useLoadingWrapper(() =>
	toast.withErrorToast(async () => {
		if (!id.value) {
			return;
		}
		const result = await seasonFormModal.open({ id: id.value }).result;
		if (result) {
			if (!isExternal.value && result.season.serieId !== routeSerieId.value) {
				await navigateTo(`/app/series/internal/${result.season.serieId}/seasons/${result.season.id}`);
				return;
			}
			setSeason(result.season);
			collections.value = result.collections;
		}
	}),
);

const pendingStatus = usePendingValue<MediaStatus>();
const status = computed({
	get: () => (pendingStatus.isPending ? pendingStatus.value : (season.value?.media.status ?? undefined)),
	set: (value) => pendingStatus.track(value, updateStatus),
});
const { loading: isUpdatingStatus, execute: updateStatus } = useLoadingWrapper((value: MediaStatus | undefined) =>
	toast.withErrorToast(async () => {
		if (id.value) {
			setSeason(await trpc.season.update.mutate({ id: id.value, status: value ?? null }));
		}
	}),
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
		if (id.value) {
			collections.value = await trpc.media.updateCollections.mutate({ id: id.value, collectionIds });
		}
	}),
);
const pendingRating = usePendingValue<number>();
const rating = computed({
	get: () => (pendingRating.isPending ? pendingRating.value : (season.value?.media.rating ?? undefined)),
	set: (value) => pendingRating.track(value, updateRating),
});
const updateRating = useDebounceFn(
	(value: number | undefined) =>
		toast.withErrorToast(async () => {
			if (id.value) {
				setSeason(await trpc.season.update.mutate({ id: id.value, rating: value ?? null }));
			}
		}),
	DEBOUNCE_TIMER,
);
</script>
