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
			<div class="flex gap-2 flex-wrap" v-if="isExternal">
				<template v-if="isFetchingDetails">
					<USkeleton v-for="i in 3" :key="i" class="h-[24px] w-24 rounded-sm" />
				</template>
				<template v-else>
					<AdultBadge :adult="serieDetails?.details?.adult ?? undefined" />
					<DetailsReleaseBadge :start-date="serieDetails?.details?.first_air_date ?? undefined" />
					<DetailsSeasonCountBadge :count="serieDetails?.details?.number_of_seasons ?? undefined" />
					<DetailsEpisodeCountBadge :count="serieDetails?.details?.number_of_episodes ?? undefined" />
					<VoteBadge
						:score="serieDetails?.details?.vote_average ?? undefined"
						:count="serieDetails?.details?.vote_count ?? undefined"
					/>
				</template>
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
				<template #seasons>
					<UCard :ui="{ body: 'p-0! h-full' }" class="h-full">
						<UTable :data="serieDetails?.seasons" :columns="seasonColumns" :loading="isFetchingDetails">
							<template #empty>
								<UEmpty title="No seasons found" variant="naked" icon="i-lucide-ban" />
							</template>
							<template #image-cell="{ row }">
								<ImageFallback
									:width="60"
									:height="90"
									class="rounded-sm"
									provider="tmdb"
									:src="row.original.poster_path"
								/>
							</template>
							<template #date-cell="{ row }">
								<NuxtTime
									v-if="row.original.air_date"
									:datetime="row.original.air_date"
									year="numeric"
									month="short"
									day="numeric"
									timezone="UTC"
								/>
							</template>
							<template #vote-cell="{ row }">
								<VoteBadge :score="row.original.vote_average ?? undefined" />
							</template>
							<template #actions-cell="{ row }">
								<ToggleButton
									variant="ghost"
									:is-added="!!row.original.internal_season"
									:aria-label="`${row.original.internal_season ? 'Remove' : 'Add'} ${row.original.name || `season ${row.original.season_number}`} ${row.original.internal_season ? 'from' : 'to'} My List`"
									:onClickOn="() => addSeasonToMyList(row.original)"
									:onClickOff="() => removeSeasonFromMyList(row.original)"
								/>
							</template>
						</UTable>
					</UCard>
				</template>
			</UTabs>
		</main>
	</div>
</template>

<script setup lang="ts">
import type { TabsItem, TableColumn } from "@nuxt/ui";
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
const seasonStore = useSeasonStore();
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
		onError: (err) => {
			if (getTRPCErrorCode(err) === "NOT_FOUND") {
				notFound.value = true;
			} else {
				toast.error(err, { description: "Failed to fetch series details" });
			}
		},
	},
);

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
	isExternal.value
		? [
				{ icon: "i-lucide-users", label: "Credits", slot: "credits" },
				{ icon: "i-lucide-layers", label: "Seasons", slot: "seasons" },
			]
		: [],
);

const seasonColumns: TableColumn<TmdbSerieSeason>[] = [
	{ id: "image", meta: { class: { td: "w-[60px]" } } },
	{
		id: "title",
		header: "Title",
		cell: ({ row }) =>
			row.original.internal_season?.media.name ?? row.original.name ?? `Season ${row.original.season_number}`,
		meta: { class: { td: "max-w-[120px] truncate font-bold text-default" } },
	},
	{
		id: "synopsis",
		header: "Synopsis",
		cell: ({ row }) => row.original.internal_season?.overview ?? row.original.overview,
		meta: { class: { td: "max-w-[300px] truncate" } },
	},
	{
		accessorKey: "episode_count",
		header: "Episodes",
		meta: { class: { th: "w-0 whitespace-nowrap", td: "w-0 whitespace-nowrap" } },
	},
	{
		id: "date",
		header: "Released At",
		meta: { class: { th: "w-0 whitespace-nowrap", td: "w-0 whitespace-nowrap" } },
	},
	{ id: "vote", header: "Vote", meta: { class: { th: "w-0 whitespace-nowrap", td: "w-0 whitespace-nowrap" } } },
	{ id: "actions", meta: { class: { th: "w-0 whitespace-nowrap", td: "w-0 whitespace-nowrap" } } },
];

// Update the series details when the user's series is added, edited, or removed
const _setSerieDetailsSerie = (serie?: Serie) => {
	if (serieDetails.value) {
		serieDetails.value = {
			...serieDetails.value,
			serie: serie ?? null,
			collections: serie ? serieDetails.value.collections : [],
			seasons: serie
				? serieDetails.value.seasons
				: serieDetails.value.seasons.map((season) => ({ ...season, internal_season: undefined })),
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

const addSeasonToMyList = (season: TmdbSerieSeason) =>
	toast.withErrorToast(async () => {
		if (season.internal_season) {
			return;
		}
		const result = await seasonStore.createSeasonFromExternal({
			externalSerieId: routeSerieId.value,
			seasonNumber: season.season_number,
		});
		season.internal_season = result.season;
		_setSerieDetailsSerie(result.serie);
	});

const removeSeasonFromMyList = (season: TmdbSerieSeason) =>
	toast.withErrorToast(async () => {
		if (!season.internal_season) {
			return;
		}
		const { id } = season.internal_season;
		const result = await openConfirmationModal(() => seasonStore.deleteSeason({ id }), {
			icon: "i-lucide-trash",
			title: "Delete this season",
			message: "This also deletes its saved episodes. Press confirm to proceed.",
		});
		if (result) {
			season.internal_season = undefined;
		}
	});
</script>
