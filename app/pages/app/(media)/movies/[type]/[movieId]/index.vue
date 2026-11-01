<template>
	<div class="flex gap-8 w-full">
		<!-- Side bar with image and actions -->
		<aside>
			<UCard :ui="{ body: 'flex flex-col gap-y-4' }" variant="subtle" class="w-80">
				<!-- Image -->
				<ImageFallback provider="tmdb" :src="image" :height="400" class="rounded-md" :loading="isPageLoading" />

				<!-- Actions -->
				<template v-if="isPageLoading">
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
							label="Edit the movie"
							block
							leading-icon="i-lucide-square-pen"
							variant="subtle"
							color="info"
							:loading="isEditingMovie"
							@click="editMovie"
						/>

						<StatusSelectMenu
							variant="subtle"
							v-model="status"
							@update:model-value="updateStatus"
							:loading="isUpdatingStatus"
						/>
						<CollectionSelectMenu
							variant="subtle"
							v-model="selectedCollectionIds"
							@update:model-value="updateCollections"
							:loading="isUpdatingCollections"
						/>
						<DetailsRatingPopover
							variant="subtle"
							color="neutral"
							v-model="rating"
							@update:model-value="updateRating"
						/>
					</template>
				</template>
			</UCard>
		</aside>

		<!-- Main section -->
		<main class="flex-1 min-w-0 flex flex-col gap-y-6">
			<!-- Title and tagline -->
			<DetailsTitleHeader :loading="isPageLoading" :title="title" :subtitle="tagline" />

			<!-- Details badges -->
			<div class="flex gap-2 flex-wrap" v-if="isExternal">
				<template v-if="isPageLoading">
					<USkeleton v-for="i in 3" :key="i" class="h-[24px] w-24 rounded-sm" />
				</template>
				<template v-else>
					<AdultBadge :adult="tmdbDetails?.details?.adult ?? undefined" />
					<DetailsDateBadge :date="tmdbDetails?.details?.release_date ?? undefined" />
					<DetailsReleaseBadge :start-date="tmdbDetails?.details?.release_date ?? undefined" />
					<DetailsDurationBadge :duration="tmdbDetails?.details?.runtime ?? undefined" />
					<VoteBadge
						:score="tmdbDetails?.details?.vote_average ?? undefined"
						:count="tmdbDetails?.details?.vote_count ?? undefined"
					/>
				</template>
			</div>

			<!-- Synopsis -->
			<DetailsOverview
				:loading="isPageLoading"
				:overview="userMovie?.overview ?? tmdbDetails?.details?.overview ?? undefined"
			/>

			<!-- Genres -->
			<DetailsGenreBadges :loading="isPageLoading" v-if="isExternal" :genres="genres" />

			<!-- Note -->
			<DetailsPersonalNote :description="note" v-if="note && !isPageLoading" />

			<UTabs :items="tabs" variant="link">
				<template #credits>
					<!-- Credits -->
					<DetailsCreditCards
						:credits="credits"
						image-provider="tmdb"
						:loading="isPageLoading"
						:show-more-to="`https://www.themoviedb.org/movie/${routeMovieId}/cast`"
						:credit-card-to-fn="(c: TmdbCredit) => `https://www.themoviedb.org/person/${c.id}`"
					/>
				</template>
				<template #saga>
					<UCard :ui="{ body: 'p-0! h-full' }" class="h-full">
						<UTable
							:data="sagaMovies"
							:columns="sagaColumns"
							@select="(_e, row) => openSagaMovie(row.original)"
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
								<AdultBadge :adult="row.original.adult ?? undefined" />
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
								<VoteBadge
									:score="row.original.vote_average ?? undefined"
									:count="row.original.vote_count ?? undefined"
								/>
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
import { useDebounceFn } from "@vueuse/core";

import { LazyMovieFormModal } from "#components";
import { MediaStatus } from "#prisma/enums";
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
const movieStore = useMovieStore();
const toast = useStatusToast();
const overlay = useOverlay();
const movieFormModal = overlay.create(LazyMovieFormModal);
const { openConfirmationModal } = useConfirmation();

// Route-derived state: `type` is "internal" (movie in my list) or "external" (TMDB), `movieId` is the matching id
const sourceType = computed(() => route.params.type as MediaSourceType);
const routeMovieId = computed(() => route.params.movieId as string);
const isExternal = computed(() => sourceType.value === MediaSourceTypes.external);
const isInternal = computed(() => sourceType.value === MediaSourceTypes.internal);

// Editable metadata of the user's movie, kept local so the controls update instantly
const rating = ref<number | undefined>(undefined);
const selectedCollectionIds = ref<string[]>([]);
const status = ref<MediaStatus | undefined>(undefined);

// Values derived from the user's own movie entry, falling back to TMDB data when it isn't in my list
const isInMyList = computed(() => !!userMovie.value);
const userMovieId = computed(() => userMovie.value?.id);
const note = computed(() => userMovie.value?.media.note ?? undefined);
const title = computed(() => userMovie.value?.media.name ?? tmdbDetails.value?.details?.title ?? undefined);

// Fetch the page data: internal movies come from my list, external ones from TMDB (NOT_FOUND shows no toast)
const { data: movieDetails, pending: isFetchingDetails } = useClientAsyncData<MovieDetails | undefined>(
	async () => {
		if (isInternal.value) {
			return trpc.movie.getInternalDetails.query({ id: routeMovieId.value });
		} else {
			return trpc.movie.getExternalDetails.query({ externalMovieId: routeMovieId.value });
		}
	},
	{
		ignoreError: (err) => getTRPCErrorCode(err) === "NOT_FOUND",
	},
);

// The user's movie, writable to reflect additions, edits and removals on the page
const userMovie = computed<Movie | undefined>({
	get: () => movieDetails.value?.movie ?? undefined,
	set: (movie) => {
		if (movieDetails.value) {
			movieDetails.value = { ...movieDetails.value, movie: movie ?? null };
		}
	},
});

// The TMDB details, only available for external movies
const tmdbDetails = computed(() => (movieDetails.value?.details ? movieDetails.value : undefined));

// Reset the editable fields whenever the user's movie changes (loaded, added, edited or removed)
watch(userMovie, (newValue) => {
	rating.value = newValue?.media.rating ?? undefined;
	status.value = newValue?.media.status ?? undefined;

	if (!newValue) {
		selectedCollectionIds.value = [];
	}
});

// Values derived from the TMDB details
const image = computed(() => tmdbDetails.value?.details?.poster_path ?? undefined);
const tagline = computed(() => tmdbDetails.value?.details?.tagline ?? undefined);
const genres = computed(() => tmdbDetails.value?.details?.genres);
const credits = computed(() => tmdbDetails.value?.credits);
const hasSaga = computed(() => !!tmdbDetails.value?.saga && tmdbDetails.value?.saga.movies.length > 1);
const sagaName = computed(() => tmdbDetails.value?.saga?.name ?? "Unknown");
const sagaMovies = computed(() => tmdbDetails.value?.saga?.movies);

// Sync the selected collections with the movie collections
watch(
	() => movieDetails.value?.collections,
	(newValue) => {
		selectedCollectionIds.value = newValue?.map((x) => x.id) ?? [];
	},
);

// Derived UI state: tabs are only shown for external movies (credits, and saga when it has several movies)
const isPageLoading = computed(() => isFetchingDetails.value);
const tabs = computed<TabsItem[]>(() => [
	...(isExternal.value ? [{ icon: "i-lucide-users", label: "Credits", slot: "credits" }] : []),
	...(isExternal.value && hasSaga.value
		? [{ icon: "i-lucide-layers", label: `Saga (${sagaName.value})`, slot: "saga" }]
		: []),
]);

// Saga table structure
const sagaColumns: TableColumn<TmdbMovieSagaMovie>[] = [
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

// Helper: keep the saga table in sync by attaching (or clearing) the user's movie on the matching saga entry
const _syncSagaMovieUserEntry = (externalId?: string, internalMovie?: Movie) => {
	if (!externalId) {
		return;
	}

	const target = tmdbDetails.value?.saga?.movies?.find((m) => m?.id === externalId);
	if (target) {
		target.internal_movie = internalMovie;
	}
};

// Remove the movie from my list after confirmation
const _removeFromMyList = () =>
	toast.withErrorToast(async () => {
		if (!isInMyList.value) {
			return;
		}

		// Confirm the deletion of the movie
		const result = await openConfirmationModal(
			async () => {
				await movieStore.deleteMovie({ id: userMovie.value!.id });
			},
			{
				icon: "i-lucide-trash",
				title: "Delete this movie",
				message: "You are about to delete this movie from your list. Press confirm to proceed",
			},
		);

		if (!result) {
			return;
		}

		userMovie.value = undefined;
		_syncSagaMovieUserEntry(routeMovieId.value, undefined);

		// Go back to the main movies page in the current movie is internal
		if (isInternal.value) {
			await navigateTo("/app/movies");
		}
	});

const { loading: isRemovingFromMyList, execute: removeFromMyList } = useLoadingWrapper(_removeFromMyList);

// Add the external movie to my list
const _addToMyList = () =>
	toast.withErrorToast(async () => {
		if (isInMyList.value) {
			return;
		}

		const movie = await movieStore.createMovieFromExternal({ externalMovieId: routeMovieId.value });
		userMovie.value = movie;
		_syncSagaMovieUserEntry(routeMovieId.value, movie);
	});

const { loading: isAddingToMyList, execute: addToMyList } = useLoadingWrapper(_addToMyList);

// Open the edit modal and apply the returned changes to the page
const _editMovie = async () =>
	toast.withErrorToast(async () => {
		if (!isInMyList.value) {
			return;
		}

		const instance = movieFormModal.open({ id: userMovie.value!.id });
		const result = await instance.result;

		if (result) {
			userMovie.value = result.movie;
			selectedCollectionIds.value = result.collections.map((c) => c.id);
			_syncSagaMovieUserEntry(result.movie.media.externalId ?? undefined, result.movie);
		}
	});

const { loading: isEditingMovie, execute: editMovie } = useLoadingWrapper(_editMovie);

// Metadata updates: persist the new value for the user's movie
const _updateStatus = (newStatus?: MediaStatus) =>
	toast.withErrorToast(async () => {
		if (!isInMyList.value) {
			return;
		}

		await trpc.movie.update.mutate({
			id: userMovieId.value!,
			status: newStatus ?? null,
		});
	});

const { loading: isUpdatingStatus, execute: updateStatus } = useLoadingWrapper(_updateStatus);

const _updateCollections = () =>
	toast.withErrorToast(async () => {
		if (!isInMyList.value) {
			return;
		}

		await trpc.media.updateCollections.mutate({
			id: userMovieId.value!,
			collectionIds: selectedCollectionIds.value,
		});
	});

const { loading: isUpdatingCollections, execute: updateCollections } = useLoadingWrapper(_updateCollections);

const _updateRating = () =>
	toast.withErrorToast(async () => {
		if (!isInMyList.value) {
			return;
		}

		await trpc.movie.update.mutate({
			id: userMovieId.value!,
			rating: rating.value ?? null,
		});
	});

// Debounced so that dragging/typing a rating doesn't send a request per change
const updateRating = useDebounceFn(_updateRating, DEBOUNCE_TIMER);

// Saga table actions: add or remove a saga movie from my list, keeping the current page in sync
const addSagaMovieToMyList = (tmdbSagaMovie: TmdbMovieSagaMovie) =>
	toast.withErrorToast(async () => {
		// If already in my list
		if (tmdbSagaMovie.internal_movie?.id) {
			return;
		}

		const movie = await movieStore.createMovieFromExternal({
			externalMovieId: tmdbSagaMovie.id,
		});

		_syncSagaMovieUserEntry(tmdbSagaMovie.id, movie);

		// If the saga movie is the current movie details
		if (tmdbSagaMovie.id === routeMovieId.value && !!userMovie.value) {
			userMovie.value = movie;
		}
	});

const removeSagaMovieFromMyList = (tmdbSagaMovie: TmdbMovieSagaMovie) =>
	toast.withErrorToast(async () => {
		// If not in my list
		if (!tmdbSagaMovie.internal_movie?.id) {
			return;
		}

		await movieStore.deleteMovie({ id: tmdbSagaMovie.internal_movie.id });

		_syncSagaMovieUserEntry(tmdbSagaMovie.id, undefined);

		// If the saga movie is the current movie details
		if (tmdbSagaMovie.internal_movie.id === userMovie.value?.id) {
			userMovie.value = undefined;
		}
	});

// Navigate to the selected saga movie's external details page
const openSagaMovie = (tmdbMovie: TmdbMovieSagaMovie) => navigateTo({ path: `/app/movies/external/${tmdbMovie.id}` });
</script>
