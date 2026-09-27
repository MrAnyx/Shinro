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
			@add="addMovie"
			@remove="removeMovie"
			@edit="editMovie"
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
					<USkeleton v-for="i in 3" :key="i" class="h-[24px] w-24 rounded-sm" />
				</template>
				<template v-else>
					<AdultBadge :adult="tmdbMovieDetails?.details.adult" />
					<DetailsDateBadge :date="tmdbMovieDetails?.details.release_date ?? undefined" />
					<DetailsReleaseBadge :start-date="tmdbMovieDetails?.details.release_date ?? undefined" />
					<DetailsDurationBadge :duration="tmdbMovieDetails?.details.runtime" />
					<VoteBadge
						:score="tmdbMovieDetails?.details.vote_average"
						:count="tmdbMovieDetails?.details.vote_count"
					/>
				</template>
			</div>

			<!-- Synopsis -->
			<DetailsOverview
				:loading="isLoading"
				:overview="myMovieDetails?.overview ?? tmdbMovieDetails?.details.overview ?? undefined"
			/>

			<!-- Genres -->
			<DetailsGenreBadges :loading="isLoading" v-if="isExternal" :genres="genres" />

			<!-- Note -->
			<DetailsPersonalNote :description="note" v-if="note && !isLoading" />

			<UTabs :items="tabs" variant="link">
				<template #credits>
					<!-- Credits -->
					<DetailsCreditCards
						:credits="credits"
						image-provider="tmdb"
						:loading="isLoading"
						:show-more-to="`https://www.themoviedb.org/movie/${movieId}/cast`"
						:credit-card-to-fn="(credit) => `https://www.themoviedb.org/person/${credit.id}`"
					/>
				</template>
				<template #saga>
					<UCard :ui="{ body: 'p-0! h-full' }" class="h-full">
						<UTable
							:data="sagaMovies"
							:columns="sagaColumns"
							@select="(_e, row) => onSagaMovieSelected(row.original)"
						>
							<template #empty>
								<UEmpty title="No movie found" variant="naked" icon="i-lucide-ban" />
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
							<template #adult-cell="{ row }">
								<AdultBadge :adult="row.original.adult" />
							</template>
							<template #date-cell="{ row }">
								<NuxtTime
									v-if="row.original.release_date"
									:datetime="row.original.release_date"
									year="numeric"
									month="short"
									day="numeric"
									timezone="UTC"
								/>
							</template>
							<template #vote-cell="{ row }">
								<VoteBadge :score="row.original.vote_average" :count="row.original.vote_count" />
							</template>
							<template #actions-cell="{ row }">
								<ToggleButton
									variant="ghost"
									:is-added="!!row.original.internal_movie"
									:onClickOn="() => addSagaMovieToMyList(row.original)"
									:onClickOff="() => removeSagaMovieFromMyList(row.original)"
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

import { LazyMovieFormModal } from "#components";
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
const movieStore = useMovieStore();
const toast = useStatusToast();
const overlay = useOverlay();
const movieFormModal = overlay.create(LazyMovieFormModal);

// Page computed
const type = computed(() => route.params.type as MediaSourceType);
const movieId = computed(() => route.params.movieId as string);
const isExternal = computed(() => type.value === MediaSourceTypes.external);
const isInternal = computed(() => type.value === MediaSourceTypes.internal);
const mediaQueryParams = computed(() => (isInternal.value ? { id: movieId.value } : { externalId: movieId.value }));

// Local reactive state
const rating = ref<number | undefined>(undefined);
const selectedCollectionIds = ref<string[]>([]);
const status = ref<MediaStatus | undefined>(undefined);

// Get the movie from my list
const isInMyList = computed(() => !!myMovieDetails.value);
const internalId = computed(() => myMovieDetails.value?.id);
const note = computed(() => myMovieDetails.value?.media.note ?? undefined);
const title = computed(() => myMovieDetails.value?.media.name ?? tmdbMovieDetails.value?.details.title ?? undefined);

const { data: myMovieDetails, pending: loadingMyMovie } = useClientAsyncData(
	async () => (mediaQueryParams.value ? trpc.movie.getById.query(mediaQueryParams.value) : undefined),
	{
		ignoreError: (err) => getTRPCErrorCode(err) === "NOT_FOUND",
	},
);

watch(myMovieDetails, (newValue) => {
	rating.value = newValue?.media.rating ?? undefined;
	status.value = newValue?.media.status ?? undefined;

	if (!newValue) {
		selectedCollectionIds.value = [];
	}
});

// Get the tmdb movie details
const image = computed(() => tmdbMovieDetails.value?.details.poster_path ?? undefined);
const tagline = computed(() => tmdbMovieDetails.value?.details.tagline ?? undefined);
const genres = computed(() => tmdbMovieDetails.value?.details.genres);
const credits = computed(() => tmdbMovieDetails.value?.credits);
const hasSaga = computed(() => !!tmdbMovieDetails.value?.saga && tmdbMovieDetails.value?.saga.movies.length > 1);
const sagaName = computed(() => tmdbMovieDetails.value?.saga?.name ?? "Unknown");
const sagaMovies = computed(() => tmdbMovieDetails.value?.saga?.movies);

const { data: tmdbMovieDetails, pending: loadingDetails } = useClientAsyncData(
	() => trpc.tmdbMovie.details.query({ movieId: movieId.value }),
	{
		enabled: () => isExternal.value,
	},
);

// Get the movie collections
const { data: myMovieCollections, pending: loadingMovieCollections } = useClientAsyncData(
	async () => (mediaQueryParams.value ? trpc.media.getCollections.query(mediaQueryParams.value) : undefined),
	{
		ignoreError: (err) => getTRPCErrorCode(err) === "NOT_FOUND",
	},
);

watch(myMovieCollections, (newValue) => {
	selectedCollectionIds.value = newValue?.map((x) => x.id) ?? [];
});

// Derived UI state
const isLoading = computed(() => loadingDetails.value || loadingMyMovie.value || loadingMovieCollections.value);
const tabs = computed<TabsItem[]>(() => [
	...(isExternal.value ? [{ icon: "i-lucide-users", label: "Credits", slot: "credits" }] : []),
	...(isExternal.value && hasSaga.value
		? [{ icon: "i-lucide-layers", label: `Saga (${sagaName.value})`, slot: "saga" }]
		: []),
]);

// Saga table structure
const sagaColumns: TableColumn<TmdbMovieCollectionPartDefaultView>[] = [
	{
		id: "image",
		meta: { class: { td: "w-[60px]" } },
	},
	{
		id: "title",
		header: "Title",
		cell: ({ row }) => row.original.internal_movie?.media.name ?? row.original.title,
		meta: { class: { td: "max-w-[120px] truncate font-bold text-default" } },
	},
	{
		id: "synopsis",
		header: "Synopsis",
		cell: ({ row }) => row.original.internal_movie?.overview ?? row.original.overview,
		meta: { class: { td: "max-w-[300px] truncate" } },
	},
	{
		id: "adult",
		header: "Category",
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
const _updateSagaMovieInternalMovie = (externalId?: string, internalMovie?: MovieWithMediaView) => {
	if (!externalId) {
		return;
	}

	const target = tmdbMovieDetails.value?.saga?.movies?.find((m) => m?.id === externalId);
	if (target) {
		target.internal_movie = internalMovie;
	}
};

// Methods
const removeMovie = () =>
	toast.withErrorToast(async () => {
		if (!isInMyList.value) {
			return;
		}

		await movieStore.deleteMovie({ id: myMovieDetails.value!.id });
		myMovieDetails.value = undefined;
		_updateSagaMovieInternalMovie(movieId.value, undefined);

		// Go back to the main movies page in the current movie is internal
		if (isInternal.value) {
			await navigateTo("/app/movies");
		}
	});

const addMovie = () =>
	toast.withErrorToast(async () => {
		if (isInMyList.value) {
			return;
		}

		const movie = await movieStore.createMovieFromExternal({ externalId: movieId.value });
		myMovieDetails.value = movie;
		_updateSagaMovieInternalMovie(movieId.value, movie);
	});

const editMovie = async () => {
	if (!isInMyList.value) {
		return;
	}

	const instance = movieFormModal.open({ id: myMovieDetails.value!.id });
	const result = await instance.result;

	if (result) {
		myMovieDetails.value = result.movie;
		selectedCollectionIds.value = result.collections.map((c) => c.id);
		_updateSagaMovieInternalMovie(result.movie.media.externalId ?? undefined, result.movie);
	}
};

// Metadata updates
const updateStatus = (newStatus?: MediaStatus) =>
	toast.withErrorToast(async () => {
		if (!isInMyList.value) {
			return;
		}
		await trpc.movie.update.mutate({
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
		await trpc.movie.update.mutate({
			id: internalId.value!,
			rating: rating.value ?? null,
		});
	});

// Saga table actions
const addSagaMovieToMyList = (tmdbSagaMovie: TmdbMovieCollectionPartDefaultView) =>
	toast.withErrorToast(async () => {
		// If already in my list
		if (tmdbSagaMovie.internal_movie?.id) {
			return;
		}

		const movie = await movieStore.createMovieFromExternal({
			externalId: tmdbSagaMovie.id,
		});

		_updateSagaMovieInternalMovie(tmdbSagaMovie.id, movie);

		// If the saga movie is the current movie details
		if (tmdbSagaMovie.id === movieId.value && !!myMovieDetails.value) {
			myMovieDetails.value = movie;
		}
	});

const removeSagaMovieFromMyList = (tmdbSagaMovie: TmdbMovieCollectionPartDefaultView) =>
	toast.withErrorToast(async () => {
		// If not in my list
		if (!tmdbSagaMovie.internal_movie?.id) {
			return;
		}

		await movieStore.deleteMovie({ id: tmdbSagaMovie.internal_movie.id });

		_updateSagaMovieInternalMovie(tmdbSagaMovie.id, undefined);

		// If the saga movie is the current movie details
		if (tmdbSagaMovie.internal_movie.id === myMovieDetails.value?.id) {
			myMovieDetails.value = undefined;
		}
	});

const onSagaMovieSelected = (tmdbMovie: TmdbMovieCollectionPartDefaultView) =>
	navigateTo({ path: `/app/movies/external/${tmdbMovie.id}` });
</script>
