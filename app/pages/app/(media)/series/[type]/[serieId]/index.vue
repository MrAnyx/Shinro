<template>
	<UEmpty
		v-if="notFound"
		title="Series not found"
		description="This series is not available."
		icon="i-lucide-search-x"
	/>
	<div v-else class="flex flex-col lg:flex-row gap-8 w-full">
		<!-- Side bar with image and actions -->
		<aside class="w-full lg:w-80 shrink-0">
			<UCard :ui="{ body: 'flex flex-col gap-y-4' }" variant="subtle">
				<!-- Image -->
				<ImageFallback
					provider="tmdb"
					:src="serieDetails?.details?.poster_path ?? undefined"
					:height="400"
					class="rounded-md"
					:loading="isFetchingDetails"
				/>

				<!-- Actions -->
				<template v-if="isFetchingDetails">
					<USkeleton class="w-full h-[32px] rounded-sm" />
					<USkeleton class="w-full h-[32px] rounded-sm" />
				</template>
				<template v-else>
					<UButton
						label="Add to My List"
						block
						leading-icon="i-lucide-plus"
						variant="subtle"
						color="success"
						v-if="!isInMyList && isExternal"
						:loading="isAddingToMyList"
						@click="addToMyList"
					/>

					<template v-else-if="isInMyList">
						<UButton
							label="Remove from My List"
							block
							leading-icon="i-lucide-trash"
							variant="subtle"
							color="error"
							:loading="isRemovingFromMyList"
							@click="removeFromMyList"
						/>

						<UButton
							label="Edit the series"
							block
							leading-icon="i-lucide-square-pen"
							variant="subtle"
							color="info"
							:loading="isEditingSerie"
							@click="editSerie"
						/>

						<StatusSelectMenu
							variant="subtle"
							:type="MediaType.SERIE"
							v-model="status"
							:loading="isUpdatingStatus"
						/>
						<CollectionSelectMenu
							variant="subtle"
							v-model="selectedCollectionIds"
							:loading="isUpdatingCollections"
						/>
						<DetailsRatingPopover variant="subtle" color="neutral" v-model="rating" />
					</template>
				</template>
			</UCard>
		</aside>

		<!-- Main section -->
		<main class="flex-1 min-w-0 flex flex-col gap-y-6">
			<!-- Title and tagline -->
			<DetailsTitleHeader
				:loading="isFetchingDetails"
				:title="serieDetails?.serie?.media.name ?? serieDetails?.details?.name ?? undefined"
				:subtitle="serieDetails?.details?.tagline ?? undefined"
			/>

			<!-- Details badges -->
			<div class="flex gap-2 flex-wrap" v-if="isExternal && serieDetails?.details">
				<AdultBadge :adult="serieDetails.details.adult ?? undefined" />
				<DetailsReleaseBadge :start-date="serieDetails.details.first_air_date ?? undefined" />
				<DetailsSeasonCountBadge
					v-if="serieDetails.details.number_of_seasons != null"
					:count="serieDetails.details.number_of_seasons"
				/>
				<DetailsEpisodeCountBadge
					v-if="serieDetails.details.number_of_episodes != null"
					:count="serieDetails.details.number_of_episodes"
				/>
				<VoteBadge
					:score="serieDetails.details.vote_average ?? undefined"
					:count="serieDetails.details.vote_count ?? undefined"
				/>
			</div>

			<!-- Synopsis -->
			<DetailsOverview
				:loading="isFetchingDetails"
				:overview="serieDetails?.serie?.overview ?? serieDetails?.details?.overview ?? undefined"
			/>

			<!-- Genres -->
			<DetailsGenreBadges
				:loading="isFetchingDetails"
				v-if="isExternal"
				:genres="serieDetails?.details?.genres"
			/>

			<!-- Note -->
			<DetailsPersonalNote
				:description="serieDetails?.serie?.media.note ?? undefined"
				v-if="serieDetails?.serie?.media.note && !isFetchingDetails"
			/>

			<UTabs :items="tabs" variant="link">
				<template #credits>
					<!-- Credits -->
					<DetailsCreditCards
						:credits="serieDetails?.credits"
						image-provider="tmdb"
						:loading="isFetchingDetails"
						:show-more-to="`https://www.themoviedb.org/tv/${routeSerieId}/cast`"
						:credit-card-to-fn="(c: TmdbCredit) => `https://www.themoviedb.org/person/${c.id}`"
					/>
				</template>
			</UTabs>
		</main>
	</div>
</template>

<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";
import { useDebounceFn } from "@vueuse/core";

import { LazySerieFormModal } from "#components";
import { MediaStatus, MediaType } from "#prisma/enums";
import type { TmdbCredit } from "~/types/tmdb";

definePageMeta({
	validate(route) {
		return (
			typeof route.params.type === "string" &&
			(Object.values(MediaSourceTypes) as string[]).includes(route.params.type)
		);
	},
});

// Composables
const route = useRoute();
const trpc = useTrpc();
const serieStore = useSerieStore();
const toast = useStatusToast();
const overlay = useOverlay();
const serieFormModal = overlay.create(LazySerieFormModal);
const { openConfirmationModal } = useConfirmation();

// Route-derived state: `type` is "internal" (series in my list) or "external" (TMDB), `serieId` is the matching id
const sourceType = computed(() => route.params.type as MediaSourceType);
const routeSerieId = computed(() => route.params.serieId as string);
const isExternal = computed(() => sourceType.value === MediaSourceTypes.external);
const isInternal = computed(() => sourceType.value === MediaSourceTypes.internal);

// Fetch the page data: internal series come from my list, external ones from TMDB (NOT_FOUND shows the empty state)
const notFound = ref(false);
const { data: serieDetails, pending: isFetchingDetails } = useClientAsyncData<SerieDetails>(
	async () => {
		if (isInternal.value) {
			return trpc.serie.getInternalDetails.query({ id: routeSerieId.value });
		} else {
			return trpc.serie.getExternalDetails.query({ externalSerieId: routeSerieId.value });
		}
	},
	{
		watch: [routeSerieId, isExternal],
		onError: (err) => {
			if (getTRPCErrorCode(err) === "NOT_FOUND") {
				notFound.value = true;
			} else {
				toast.error(err, { description: "Failed to fetch series details" });
			}
		},
	},
);

watch([routeSerieId, isExternal], () => {
	notFound.value = false;
});

// Pending values are shown right away while the update (debounced for rating) is in flight
const pendingCollectionIds = usePendingValue<string[]>();
const selectedCollectionIds = computed({
	get: () =>
		pendingCollectionIds.isPending
			? pendingCollectionIds.value!
			: (serieDetails.value?.collections.map((c) => c.id) ?? []),
	set: (collectionIds) => {
		pendingCollectionIds.track(collectionIds, updateCollections);
	},
});

const pendingStatus = usePendingValue<MediaStatus>();
const status = computed({
	get: () => (pendingStatus.isPending ? pendingStatus.value : (serieDetails.value?.serie?.media.status ?? undefined)),
	set: (newStatus) => {
		pendingStatus.track(newStatus, updateStatus);
	},
});

const pendingRating = usePendingValue<number>();
const rating = computed({
	get: () => (pendingRating.isPending ? pendingRating.value : (serieDetails.value?.serie?.media.rating ?? undefined)),
	set: (newRating) => {
		pendingRating.track(newRating, updateRating);
	},
});

const isInMyList = computed(() => !!serieDetails.value?.serie);
const userSerieId = computed(() => serieDetails.value?.serie?.id);

// Derived UI state: tabs are only shown for external series
const tabs = computed<TabsItem[]>(() =>
	isExternal.value ? [{ icon: "i-lucide-users", label: "Credits", slot: "credits" }] : [],
);

// Update the series details when the user's series is added, edited, or removed
const _setSerieDetailsSerie = (serie?: Serie) => {
	if (serieDetails.value) {
		serieDetails.value = {
			...serieDetails.value,
			serie: serie ?? null,
			collections: serie ? serieDetails.value.collections : [],
		};
	}
};

// Remove the series from my list after confirmation
const { loading: isRemovingFromMyList, execute: removeFromMyList } = useLoadingWrapper(() =>
	toast.withErrorToast(async () => {
		if (!isInMyList.value) {
			return;
		}

		// Confirm the deletion of the series
		const result = await openConfirmationModal(
			() => serieStore.deleteSerie({ id: serieDetails.value!.serie!.id }),
			{
				icon: "i-lucide-trash",
				title: "Delete this series",
				message: "This also deletes its saved seasons and episodes. Press confirm to proceed.",
			},
		);

		if (!result) {
			return;
		}

		_setSerieDetailsSerie();

		// Go back to the main series page if the current series is internal
		if (isInternal.value) {
			await navigateTo("/app/series");
		}
	}),
);

// Add the external series to my list
const { loading: isAddingToMyList, execute: addToMyList } = useLoadingWrapper(() =>
	toast.withErrorToast(async () => {
		if (isInMyList.value) {
			return;
		}

		const serie = await serieStore.createSerieFromExternal({ externalSerieId: routeSerieId.value });
		_setSerieDetailsSerie(serie);
	}),
);

// Open the edit modal and apply the returned changes to the page
const { loading: isEditingSerie, execute: editSerie } = useLoadingWrapper(() =>
	toast.withErrorToast(async () => {
		if (!isInMyList.value) {
			return;
		}

		const instance = serieFormModal.open({ id: serieDetails.value!.serie!.id });
		const result = await instance.result;

		if (result) {
			_setSerieDetailsSerie(result.serie);
			serieDetails.value!.collections = result.collections;
		}
	}),
);

// Metadata updates: persist the new value for the user's series
const { loading: isUpdatingStatus, execute: updateStatus } = useLoadingWrapper((newStatus: MediaStatus | undefined) =>
	toast.withErrorToast(async () => {
		if (!isInMyList.value) {
			return;
		}

		const serie = await trpc.serie.update.mutate({
			id: userSerieId.value!,
			status: newStatus ?? null,
		});

		_setSerieDetailsSerie(serie);
	}),
);

const { loading: isUpdatingCollections, execute: updateCollections } = useLoadingWrapper((collectionIds: string[]) =>
	toast.withErrorToast(async () => {
		if (!isInMyList.value) {
			return;
		}

		serieDetails.value!.collections = await trpc.media.updateCollections.mutate({
			id: userSerieId.value!,
			collectionIds,
		});
	}),
);

// Debounced so that dragging/typing a rating doesn't send a request per change
const updateRating = useDebounceFn(
	(newRating: number | undefined) =>
		toast.withErrorToast(async () => {
			if (!isInMyList.value) {
				return;
			}

			_setSerieDetailsSerie(
				await trpc.serie.update.mutate({
					id: userSerieId.value!,
					rating: newRating ?? null,
				}),
			);
		}),
	DEBOUNCE_TIMER,
);
</script>
