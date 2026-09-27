<template>
	<div class="flex gap-8 w-full">
		<!-- Side bar with image and actions -->
		<DetailsAside
			class="w-80"
			:loading="isLoading"
			:external="isExternal"
			:in-my-list="isInMyList"
			image-provider="tmdb"
			:image="image"
			v-model:rating="rating"
			v-model:status="status"
			v-model:collections="selectedCollectionIds"
			@add="addSerie"
			@remove="removeSerie"
			@edit="editSerie"
			@update:status="updateStatus"
			@update:collections="updateCollections"
			@update:rating="updateRating"
		/>

		<!-- Main section -->
		<main class="flex-1 min-w-0 flex flex-col gap-y-6">
			<!-- Title and tagline -->
			<DetailsTitleHeader :loading="isLoading" :title="title" :subtitle="tagline" />

			<!-- Details badges -->
			<div class="flex gap-2 flex-wrap" v-if="isExternal">
				<template v-if="isLoading">
					<USkeleton v-for="i in 4" :key="i" class="h-[24px] w-24 rounded-sm" />
				</template>
				<template v-else>
					<AdultBadge :adult="tmdbSerieDetails?.details.adult" />
					<DetailsDateBadge :date="tmdbSerieDetails?.details.first_air_date ?? undefined" />
					<DetailsReleaseBadge
						:start-date="tmdbSerieDetails?.details.first_air_date ?? undefined"
						:end-date="tmdbSerieDetails?.details.last_air_date ?? undefined"
					/>
					<DetailsSeasonCountBadge :count="tmdbSerieDetails?.details.number_of_seasons" />
					<DetailsEpisodeCountBadge :count="tmdbSerieDetails?.details.number_of_episodes" />
					<VoteBadge
						:score="tmdbSerieDetails?.details.vote_average"
						:count="tmdbSerieDetails?.details.vote_count"
					/>
				</template>
			</div>

			<!-- Synopsis -->
			<DetailsOverview
				:loading="isLoading"
				:overview="mySerieDetails?.overview ?? tmdbSerieDetails?.details.overview ?? undefined"
			/>

			<!-- Genres -->
			<DetailsGenreBadges :loading="isLoading" v-if="isExternal" :genres="genres" />

			<!-- Note -->
			<DetailsPersonalNote :description="note" v-if="note && !isLoading" />

			<UTabs v-if="isExternal" :items="tabs" variant="link">
				<template #credits>
					<!-- Credits -->
					<DetailsCreditCards
						:credits="credits"
						image-provider="tmdb"
						:loading="isLoading"
						:show-more-to="`https://www.themoviedb.org/tv/${serieId}/cast`"
						:credit-card-to-fn="(credit) => `https://www.themoviedb.org/person/${credit.id}`"
					/>
				</template>
				<template #seasons>
					<UCard :ui="{ body: 'p-0! h-full' }" class="h-full">
						<UTable
							:data="seasons"
							:columns="seasonColumns"
							sticky
							@select="(_e, row) => onSeasonSelected(row.original)"
						>
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
								<VoteBadge :score="row.original.vote_average" />
							</template>
							<template #actions-cell="{ row }">
								<ToggleButton
									variant="ghost"
									:is-added="!!row.original.internal_season"
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
import type { TableColumn, TabsItem } from "@nuxt/ui";

import { LazySerieFormModal } from "#components";
import { MediaStatus } from "#prisma/enums";

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

// Page computed
const type = computed(() => route.params.type as MediaSourceType);
const serieId = computed(() => route.params.serieId as string);
const isExternal = computed(() => type.value === MediaSourceTypes.external);
const isInternal = computed(() => type.value === MediaSourceTypes.internal);
const mediaQueryParams = computed(() => (isInternal.value ? { id: serieId.value } : { externalId: serieId.value }));

// Local reactive state
const rating = ref<number | undefined>();
const selectedCollectionIds = ref<string[]>([]);
const status = ref<MediaStatus | undefined>();

// Get the serie from my list
const isInMyList = computed(() => !!mySerieDetails.value);
const internalId = computed(() => mySerieDetails.value?.id);
const note = computed(() => mySerieDetails.value?.media.note ?? undefined);
const title = computed(() => mySerieDetails.value?.media.name ?? tmdbSerieDetails.value?.details.name ?? undefined);

const { data: mySerieDetails, pending: loadingMySerie } = useClientAsyncData(
	async () => (mediaQueryParams.value ? trpc.serie.getById.query(mediaQueryParams.value) : undefined),
	{
		ignoreError: (err) => getTRPCErrorCode(err) === "NOT_FOUND",
	},
);

watch(mySerieDetails, (newValue) => {
	rating.value = newValue?.media.rating ?? undefined;
	status.value = newValue?.media.status ?? undefined;

	if (!newValue) {
		selectedCollectionIds.value = [];
	}
});

// Get the tmdb serie details
const image = computed(() => tmdbSerieDetails.value?.details.poster_path ?? undefined);
const tagline = computed(() => tmdbSerieDetails.value?.details.tagline ?? undefined);
const genres = computed(() => tmdbSerieDetails.value?.details.genres ?? []);
const credits = computed(() => tmdbSerieDetails.value?.credits ?? []);
const seasons = computed(() => tmdbSerieDetails.value?.seasons ?? []);
const hasSeasons = computed(() => seasons.value.length > 0);

const { data: tmdbSerieDetails, pending: loadingDetails } = useClientAsyncData(
	() => trpc.tmdbSerie.details.query({ id: serieId.value }),
	{
		enabled: () => isExternal.value,
	},
);

// Get the serie collections
const { data: mySerieCollections, pending: loadingSerieCollections } = useClientAsyncData(
	async () => (mediaQueryParams.value ? trpc.media.getCollections.query(mediaQueryParams.value) : undefined),
	{
		ignoreError: (err) => getTRPCErrorCode(err) === "NOT_FOUND",
	},
);

watch(mySerieCollections, (newValue) => {
	selectedCollectionIds.value = newValue?.map((collection) => collection.id) ?? [];
});

// Derived UI state
const isLoading = computed(() => loadingDetails.value || loadingMySerie.value || loadingSerieCollections.value);
const tabs = computed<TabsItem[]>(() => [
	...(isExternal.value ? [{ icon: "i-lucide-users", label: "Credits", slot: "credits" }] : []),
	...(isExternal.value && hasSeasons.value
		? [{ icon: "i-lucide-layers", label: `Seasons (${seasons.value.length})`, slot: "seasons" }]
		: []),
]);

// Seasons table structure
const seasonColumns: TableColumn<TmdbSerieDetailsSeasonDefaultView>[] = [
	{
		id: "image",
		meta: { class: { td: "w-[60px]" } },
	},
	{
		id: "title",
		header: "Title",
		cell: ({ row }) =>
			row.original.name ?? `${title.value} - S${String(row.original.season_number).padStart(2, "0")}`,
		meta: { class: { td: "max-w-[160px] truncate font-bold text-default" } },
	},
	{
		accessorKey: "overview",
		header: "Synopsis",
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
	{
		id: "vote",
		header: "Vote",
		meta: { class: { th: "w-0 whitespace-nowrap", td: "w-0 whitespace-nowrap" } },
	},
	{
		id: "actions",
		meta: { class: { th: "w-0 whitespace-nowrap", td: "w-0 whitespace-nowrap" } },
	},
];

// Helper methods
const _updateSeasonInternalSeason = (externalId?: string, internalSeason?: SeasonWithMediaView) => {
	if (!externalId) {
		return;
	}

	const target = tmdbSerieDetails.value?.seasons?.find((m) => m?.id === externalId);
	if (target) {
		target.internal_season = internalSeason;
	}
};

// Methods
const removeSerie = () =>
	toast.withErrorToast(async () => {
		if (!isInMyList.value) {
			return;
		}

		await serieStore.deleteSerie({ id: internalId.value! });
		mySerieDetails.value = undefined;

		if (isInternal.value) {
			await navigateTo("/app/series");
		}
	});

const addSerie = () =>
	toast.withErrorToast(async () => {
		if (isInMyList.value) {
			return;
		}

		const serie = await serieStore.createSerieFromExternal({ externalId: serieId.value });
		mySerieDetails.value = serie;
	});

const editSerie = async () => {
	if (!isInMyList.value) {
		return;
	}

	const instance = serieFormModal.open({ id: internalId.value! });
	const result = await instance.result;

	if (result) {
		mySerieDetails.value = result.serie;
		selectedCollectionIds.value = result.collections.map((collection) => collection.id);
	}
};

const updateStatus = (newStatus?: MediaStatus) =>
	toast.withErrorToast(async () => {
		if (!isInMyList.value) {
			return;
		}

		await trpc.serie.update.mutate({
			id: internalId.value!,
			status: newStatus ?? null,
		});
	});

const updateCollections = () =>
	toast.withErrorToast(async () => {
		if (!isInMyList.value) {
			return;
		}

		await trpc.media.updateCollections.mutate({
			id: internalId.value!,
			collectionIds: selectedCollectionIds.value,
		});
	});

const updateRating = () =>
	toast.withErrorToast(async () => {
		if (!isInMyList.value) {
			return;
		}

		await trpc.serie.update.mutate({ id: internalId.value!, rating: rating.value ?? null });
	});

const addSeasonToMyList = (tmdbSeason: TmdbSerieDetailsSeasonDefaultView) =>
	toast.withErrorToast(async () => {
		// If already in my list
		if (tmdbSeason.internal_season?.id) {
			return;
		}

		const season = await seasonStore.createSeasonFromExternal({
			externalSerieId: serieId.value,
			seasonNumber: tmdbSeason.season_number,
		});

		_updateSeasonInternalSeason(tmdbSeason.id, season);

		if (tmdbSeason.id === serieId.value && !!mySerieDetails.value) {
			mySerieDetails.value = season;
		}
	});

const removeSeasonFromMyList = (tmdbSeason: TmdbSerieDetailsSeasonDefaultView) =>
	toast.withErrorToast(async () => {
		// If already in my list
		if (!tmdbSeason.internal_season?.id) {
			return;
		}

		await seasonStore.deleteSerie({
			id: tmdbSeason.internal_season.id,
		});

		_updateSeasonInternalSeason(tmdbSeason.id, undefined);
	});

const onSeasonSelected = (tmdbSerie: TmdbSerieDetailsSeasonDefaultView) =>
	navigateTo(`/app/series/${type.value}/${serieId.value}/seasons/${tmdbSerie.season_number}`);
</script>
