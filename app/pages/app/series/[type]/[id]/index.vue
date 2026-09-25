<template>
	<div class="flex gap-8 w-full">
		<DetailsAside
			class="w-80"
			:loading="isLoading"
			:external="isExternal"
			:in-my-list="isInMyList"
			image-provider="tmdb"
			:image="tmdbSerieDetails?.details.poster_path ?? undefined"
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
			<DetailsTitleHeader
				:loading="isLoading"
				:title="mySerieDetails?.media.name ?? tmdbSerieDetails?.details.name ?? undefined"
				:subtitle="tmdbSerieDetails?.details.tagline ?? undefined"
			/>

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

			<DetailsOverview
				:loading="isLoading"
				:overview="mySerieDetails?.overview ?? tmdbSerieDetails?.details.overview ?? undefined"
			/>
			<DetailsGenreBadges :loading="isLoading" v-if="isExternal" :genres="genres" />
			<DetailsPersonalNote :description="note" v-if="note && !isLoading" />

			<UTabs v-if="isExternal" :items="tabs" variant="link">
				<template #credits>
					<DetailsCreditCards
						:credits="credits"
						image-provider="tmdb"
						:loading="isLoading"
						:show-more-to="`https://www.themoviedb.org/tv/${id}/cast`"
						:credit-card-to-fn="(credit) => `https://www.themoviedb.org/person/${credit.id}`"
					/>
				</template>
				<template #seasons>
					<UCard :ui="{ body: 'p-0! h-full' }" class="h-full">
						<UTable :data="seasons" :columns="seasonColumns" sticky @select="onSeasonSelected">
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
							<template #air_date-cell="{ row }">
								<NuxtTime
									v-if="row.original.air_date"
									:datetime="row.original.air_date"
									year="numeric"
									month="short"
									day="numeric"
									timezone="UTC"
								/>
							</template>
							<template #vote_average-cell="{ row }">
								<VoteBadge :score="row.original.vote_average" />
							</template>
							<template #actions-cell="{ row }">
								<ToggleButton
									variant="ghost"
									:is-added="!!row.original.internal_season"
									:onClickOn="() => addSeasonToMyList(row)"
									:onClickOff="() => removeSeasonFromMyList(row)"
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
import type { TableColumn, TableRow, TabsItem } from "@nuxt/ui";

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

const route = useRoute();
const trpc = useTrpc();
const serieStore = useSerieStore();
const toast = useStatusToast();
const overlay = useOverlay();

const type = computed(() => route.params.type as MediaSourceType);
const id = computed(() => route.params.id as string);
const isExternal = computed(() => type.value === MediaSourceTypes.external);
const isInternal = computed(() => type.value === MediaSourceTypes.internal);
const mediaQueryParams = computed(() => (isInternal.value ? { id: id.value } : { externalId: id.value }));

const rating = ref<number | undefined>();
const selectedCollectionIds = ref<string[]>([]);
const status = ref<MediaStatus | undefined>();

const { data: mySerieDetails, pending: loadingMySerie } = useClientAsyncData(
	async () => (mediaQueryParams.value ? trpc.serie.getById.query(mediaQueryParams.value) : undefined),
	{ ignoreError: (err) => getTRPCErrorCode(err) === "NOT_FOUND" },
);

watch(mySerieDetails, (newValue) => {
	rating.value = newValue?.media.rating ?? undefined;
	status.value = newValue?.media.status ?? undefined;

	if (!newValue) {
		selectedCollectionIds.value = [];
	}
});

const { data: tmdbSerieDetails, pending: loadingDetails } = useClientAsyncData(
	() => trpc.tmdbSerie.details.query({ id: id.value }),
	{ enabled: () => isExternal.value },
);

const { data: mySerieCollections, pending: loadingSerieCollections } = useClientAsyncData(
	async () => (mediaQueryParams.value ? trpc.media.getCollections.query(mediaQueryParams.value) : undefined),
	{ ignoreError: (err) => getTRPCErrorCode(err) === "NOT_FOUND" },
);

watch(mySerieCollections, (newValue) => {
	selectedCollectionIds.value = newValue?.map((collection) => collection.id) ?? [];
});

const genres = computed(() => tmdbSerieDetails.value?.details.genres?.flatMap((genre) => genre?.name?.trim() || []));
const isLoading = computed(() => loadingDetails.value || loadingMySerie.value || loadingSerieCollections.value);
const isInMyList = computed(() => !!mySerieDetails.value);
const note = computed(() => mySerieDetails.value?.media.note ?? undefined);
const credits = computed(() => tmdbSerieDetails.value?.credits.cast?.filter((credit) => !!credit) ?? []);
const seasons = computed(() => tmdbSerieDetails.value?.details.seasons?.filter((season) => !!season) ?? []);

const tabs = computed<TabsItem[]>(() => [
	...(isExternal.value ? [{ icon: "i-lucide-users", label: "Credits", slot: "credits" }] : []),
	...(isExternal.value
		? [{ icon: "i-lucide-layers", label: `Seasons (${seasons.value.length})`, slot: "seasons" }]
		: []),
]);

const seasonColumns: TableColumn<TmdbSerieSeasonDetailsDefaultView>[] = [
	{
		id: "image",
		meta: { class: { td: "w-[60px]" } },
	},
	{
		accessorFn: (season) => season.name ?? `Season ${season.season_number}`,
		header: "Title",
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
		id: "air_date",
		header: "Released At",
		meta: { class: { th: "w-0 whitespace-nowrap", td: "w-0 whitespace-nowrap" } },
	},
	{
		id: "vote_average",
		header: "Vote",
		meta: { class: { th: "w-0 whitespace-nowrap", td: "w-0 whitespace-nowrap" } },
	},
	{ id: "actions", meta: { class: { th: "w-0 whitespace-nowrap", td: "w-0 whitespace-nowrap" } } },
];

const serieFormModal = overlay.create(LazySerieFormModal);

const removeSerie = () =>
	toast.withErrorToast(async () => {
		if (!isInMyList.value) {
			return;
		}

		await serieStore.deleteSerie({ id: mySerieDetails.value!.id });
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

		mySerieDetails.value = await serieStore.createSerieFromExternal({ externalId: id.value });
	});

const editSerie = async () => {
	if (!isInMyList.value) {
		return;
	}

	const instance = serieFormModal.open({ id: mySerieDetails.value!.id });
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
		await trpc.serie.update.mutate({ id: mySerieDetails.value!.id, status: newStatus ?? null });
	});

const updateCollections = () =>
	toast.withErrorToast(async () => {
		if (!isInMyList.value) {
			return;
		}
		await trpc.media.updateCollections.mutate({
			id: mySerieDetails.value!.id,
			collectionIds: selectedCollectionIds.value,
		});
	});

const updateRating = () =>
	toast.withErrorToast(async () => {
		if (!isInMyList.value) {
			return;
		}
		await trpc.serie.update.mutate({ id: mySerieDetails.value!.id, rating: rating.value ?? null });
	});

const addSeasonToMyList = (row: TableRow<TmdbSerieSeasonDetailsDefaultView>) =>
	toast.withErrorToast(async () => {
		// if (!mySerieDetails.value || getInternalSeason(row.original)) {
		// 	return;
		// }
		// const savedSeason = await trpc.season.createFromExternal.mutate({
		// 	serieId: mySerieDetails.value.id,
		// 	externalId: row.original.id,
		// 	number: row.original.season_number,
		// 	name: row.original.name ?? `Season ${row.original.season_number}`,
		// 	imagePath: row.original.poster_path ?? null,
		// 	overview: row.original.overview ?? null,
		// 	status: null,
		// 	rating: null,
		// 	note: null,
		// });
		// mySeasons.value = [...(mySeasons.value ?? []), savedSeason];
		// toast.success({ description: `${savedSeason.media.name} has been added to your list` });
	});

const removeSeasonFromMyList = (row: TableRow<TmdbSerieSeasonDetailsDefaultView>) =>
	toast.withErrorToast(async () => {
		// const savedSeason = getInternalSeason(row.original);
		// if (!savedSeason) {
		// 	return;
		// }
		// await trpc.season.delete.mutate({ id: savedSeason.id });
		// mySeasons.value = mySeasons.value?.filter((season) => season.id !== savedSeason.id) ?? [];
		// toast.success({
		// 	description: `${row.original.name ?? `Season ${row.original.season_number}`} has been removed from your list`,
		// });
	});

const onSeasonSelected = (_event: Event, row: TableRow<TmdbSerieSeasonDetailsDefaultView>) => {
	return navigateTo(`/app/series/${type.value}/${id.value}/season/${row.original.season_number}`);
};
</script>
