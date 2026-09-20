<template>
	<div class="flex gap-8 w-full">
		<DetailsAside
			class="w-80"
			:loading="isLoading"
			:external="!isInMyList"
			:in-my-list="isInMyList"
			media-label="season"
			image-provider="tmdb"
			:image="season?.media.imagePath ?? tmdbSeason?.poster_path ?? undefined"
			v-model:rating="rating"
			v-model:status="status"
			v-model:collections="selectedCollectionIds"
			@add="addSeason"
			@remove="removeSeason"
			@edit="editSeason"
			@update:status="updateStatus"
			@update:collections="updateCollections"
			@update:rating="updateRating"
		/>
		<main class="flex-1 min-w-0 flex flex-col gap-y-6">
			<DetailsTitleHeader
				:loading="isLoading"
				:title="season?.media.name ?? tmdbSeason?.name ?? `Season ${seasonNumber}`"
				:subtitle="serie?.media.name ?? undefined"
			/>
			<div class="flex gap-2 flex-wrap" v-if="tmdbSeason && !isLoading">
				<DetailsDateBadge :date="tmdbSeason.air_date ?? undefined" />
				<UBadge color="neutral" variant="subtle" leading-icon="i-lucide-list-video">
					{{ tmdbSeason.episode_count ?? 0 }} episodes
				</UBadge>
				<VoteBadge :score="tmdbSeason.vote_average" />
			</div>
			<UTabs :items="tabs" variant="link">
				<template #overview>
					<div class="flex flex-col gap-y-6">
						<DetailsOverview
							:loading="isLoading"
							:overview="season?.overview ?? tmdbSeason?.overview ?? undefined"
						/>
						<DetailsPersonalNote
							:description="season?.media.note ?? undefined"
							v-if="season?.media.note && !isLoading"
						/>
					</div>
				</template>
				<template #episodes>
					<UCard :ui="{ body: 'p-0! h-full' }" class="h-full">
						<UTable :data="episodes" :columns="episodeColumns" sticky>
							<template #empty>
								<UEmpty title="No episodes found" variant="naked" icon="i-lucide-ban" />
							</template>
							<template #image-cell="{ row }">
								<ImageFallback
									:width="120"
									:height="68"
									class="rounded-sm"
									provider="tmdb"
									:src="row.original.still_path"
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
								<VoteBadge :score="row.original.vote_average" :count="row.original.vote_count" />
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

import { LazySeasonFormModal } from "#components";
import { MediaStatus } from "#prisma/enums";

definePageMeta({ layout: "app", middleware: ["auth", "series"] });

const route = useRoute();
const trpc = useTrpc();
const store = useSeasonStore();
const toast = useStatusToast();
const overlay = useOverlay();
const serieExternalId = computed(() => route.params.serieId as string);
const seasonNumber = computed(() => Number(route.params.seasonId));
const rating = ref<number | undefined>();
const status = ref<MediaStatus | undefined>();
const selectedCollectionIds = ref<string[]>([]);

const { data: tmdbSeason, pending: loadingTmdbSeason } = useClientAsyncData(() =>
	trpc.tmdbSerie.seasonDetails.query({ serieId: serieExternalId.value, seasonNumber: seasonNumber.value }),
);
const { data: serie, pending: loadingSerie } = useClientAsyncData(() =>
	trpc.serie.getById.query({ externalId: serieExternalId.value }),
);
const { data: season, pending: loadingSeason } = useClientAsyncData(
	() =>
		trpc.season.getBySerieExternalId.query({
			serieExternalId: serieExternalId.value,
			number: seasonNumber.value,
		}),
	{ ignoreError: (error) => getTRPCErrorCode(error) === "NOT_FOUND" },
);
const { data: collections, pending: loadingCollections } = useClientAsyncData(
	async () => (season.value ? trpc.media.getCollections.query({ id: season.value.id }) : []),
	{ enabled: () => !!season.value },
);

watch(
	season,
	(value) => {
		rating.value = value?.media.rating ?? undefined;
		status.value = value?.media.status ?? undefined;
	},
	{ immediate: true },
);
watch(
	collections,
	(value) => {
		selectedCollectionIds.value = value?.map((collection) => collection.id) ?? [];
	},
	{ immediate: true },
);

const isInMyList = computed(() => !!season.value);
const isLoading = computed(
	() => loadingTmdbSeason.value || loadingSerie.value || loadingSeason.value || loadingCollections.value,
);
const episodes = computed(() => tmdbSeason.value?.episodes?.filter((episode) => !!episode) ?? []);
const tabs = computed<TabsItem[]>(() => [
	{ icon: "i-lucide-file-text", label: "Overview", slot: "overview" },
	{ icon: "i-lucide-list-video", label: `Episodes (${episodes.value.length})`, slot: "episodes" },
]);
const formModal = overlay.create(LazySeasonFormModal);

const episodeColumns: TableColumn<TmdbSerieEpisodeDefaultView>[] = [
	{ id: "image", meta: { class: { td: "w-[120px]" } } },
	{
		accessorKey: "episode_number",
		header: "Episode",
		meta: { class: { th: "w-0 whitespace-nowrap", td: "w-0 whitespace-nowrap font-bold text-default" } },
	},
	{
		accessorFn: (episode) => episode.name ?? `Episode ${episode.episode_number}`,
		header: "Title",
		meta: { class: { td: "max-w-[180px] truncate font-bold text-default" } },
	},
	{
		accessorKey: "overview",
		header: "Synopsis",
		meta: { class: { td: "max-w-[320px] truncate" } },
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
];

const addSeason = () =>
	toast.withErrorToast(async () => {
		if (!serie.value || !tmdbSeason.value || isInMyList.value) {
			return;
		}
		season.value = await store.createSeasonFromExternal({
			serieId: serie.value.id,
			externalId: tmdbSeason.value.id,
			number: tmdbSeason.value.season_number,
			name: tmdbSeason.value.name ?? `Season ${tmdbSeason.value.season_number}`,
			imagePath: tmdbSeason.value.poster_path ?? null,
			overview: tmdbSeason.value.overview ?? null,
			status: null,
			rating: null,
			note: null,
		});
	});

const removeSeason = () =>
	toast.withErrorToast(async () => {
		if (!season.value) {
			return;
		}
		await store.deleteSeason({ id: season.value.id });
		season.value = null;
		selectedCollectionIds.value = [];
	});

const editSeason = async () => {
	if (!season.value) {
		return;
	}
	const result = await formModal.open({ id: season.value.id }).result;
	if (result) {
		season.value = result.season;
		selectedCollectionIds.value = result.collections.map((collection) => collection.id);
	}
};

const updateStatus = (value?: MediaStatus) =>
	toast.withErrorToast(async () => {
		if (season.value) {
			season.value = await trpc.season.update.mutate({ id: season.value.id, status: value ?? null });
		}
	});
const updateRating = () =>
	toast.withErrorToast(async () => {
		if (season.value) {
			season.value = await trpc.season.update.mutate({ id: season.value.id, rating: rating.value ?? null });
		}
	});
const updateCollections = () =>
	toast.withErrorToast(async () => {
		if (season.value) {
			await trpc.media.updateCollections.mutate({
				id: season.value.id,
				collectionIds: selectedCollectionIds.value,
			});
		}
	});
</script>
