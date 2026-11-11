<template>
	<UEmpty
		v-if="notFound"
		title="Movie not found"
		description="This movie is not available."
		icon="i-lucide-search-x"
	/>
	<div v-else class="flex flex-col lg:flex-row gap-8 w-full">
		<!-- Side bar with image and actions -->
		<aside class="w-full lg:w-80 shrink-0">
			<UCard :ui="{ body: 'flex flex-col gap-y-4' }" variant="subtle">
				<!-- Image -->
				<ImageFallback
					provider="tmdb"
					:src="movieDetails?.details?.poster_path ?? undefined"
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
							label="Edit the movie"
							block
							leading-icon="i-lucide-square-pen"
							variant="subtle"
							color="info"
							:loading="isEditingMovie"
							@click="editMovie"
						/>

						<StatusSelectMenu variant="subtle" v-model="status" :loading="isUpdatingStatus" />
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
				:title="movieDetails?.movie?.media.name ?? movieDetails?.details?.title ?? undefined"
				:subtitle="movieDetails?.details?.tagline ?? undefined"
			/>

			<!-- Details badges -->
			<div class="flex gap-2 flex-wrap" v-if="isExternal">
				<template v-if="isFetchingDetails">
					<USkeleton v-for="i in 3" :key="i" class="h-[24px] w-24 rounded-sm" />
				</template>
				<template v-else>
					<AdultBadge :adult="movieDetails?.details?.adult ?? undefined" />
					<DetailsDateBadge :date="movieDetails?.details?.release_date ?? undefined" />
					<DetailsReleaseBadge :start-date="movieDetails?.details?.release_date ?? undefined" />
					<DetailsDurationBadge :duration="movieDetails?.details?.runtime ?? undefined" />
					<VoteBadge
						:score="movieDetails?.details?.vote_average ?? undefined"
						:count="movieDetails?.details?.vote_count ?? undefined"
					/>
				</template>
			</div>

			<!-- Synopsis -->
			<DetailsOverview
				:loading="isFetchingDetails"
				:overview="movieDetails?.movie?.overview ?? movieDetails?.details?.overview ?? undefined"
			/>

			<!-- Genres -->
			<DetailsGenreBadges
				:loading="isFetchingDetails"
				v-if="isExternal"
				:genres="movieDetails?.details?.genres"
			/>

			<!-- Note -->
			<DetailsPersonalNote
				:description="movieDetails?.movie?.media.note ?? undefined"
				v-if="movieDetails?.movie?.media.note && !isFetchingDetails"
			/>

			<UTabs :items="tabs" variant="link">
				<template #credits>
					<!-- Credits -->
					<DetailsCreditCards
						:credits="movieDetails?.credits"
						image-provider="tmdb"
						:loading="isFetchingDetails"
						:show-more-to="`https://www.themoviedb.org/movie/${routeMovieId}/cast`"
						:credit-card-to-fn="(c: TmdbCredit) => `https://www.themoviedb.org/person/${c.id}`"
					/>
				</template>
				<template #saga>
					<UCard :ui="{ body: 'p-0! h-full' }" class="h-full">
						<UTable
							:data="movieDetails?.saga?.movies"
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
									@click.stop
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

// Fetch the page data: internal movies come from my list, external ones from TMDB (NOT_FOUND shows the empty state)
const notFound = ref(false);
const { data: movieDetails, pending: isFetchingDetails } = useClientAsyncData<MovieDetails | undefined>(
	async () => {
		if (isInternal.value) {
			return trpc.movie.getInternalDetails.query({ id: routeMovieId.value });
		} else {
			return trpc.movie.getExternalDetails.query({ externalMovieId: routeMovieId.value });
		}
	},
	{
		onError: (err) => {
			if (getTRPCErrorCode(err) === "NOT_FOUND") {
				notFound.value = true;
			} else {
				toast.error(err, { description: "Failed to fetch movie details" });
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
			: (movieDetails.value?.collections.map((c) => c.id) ?? []),
	set: (collectionIds) => {
		pendingCollectionIds.track(collectionIds, updateCollections);
	},
});

const pendingStatus = usePendingValue<MediaStatus>();
const status = computed({
	get: () => (pendingStatus.isPending ? pendingStatus.value : (movieDetails.value?.movie?.media.status ?? undefined)),
	set: (newStatus) => {
		pendingStatus.track(newStatus, updateStatus);
	},
});

const pendingRating = usePendingValue<number>();
const rating = computed({
	get: () => (pendingRating.isPending ? pendingRating.value : (movieDetails.value?.movie?.media.rating ?? undefined)),
	set: (newRating) => {
		pendingRating.track(newRating, updateRating);
	},
});

const isInMyList = computed(() => !!movieDetails.value?.movie);
const userMovieId = computed(() => movieDetails.value?.movie?.id);
const hasSaga = computed(() => (movieDetails.value?.saga?.movies.length ?? 0) > 1);
const sagaName = computed(() => movieDetails.value?.saga?.name ?? "Unknown");

// Derived UI state: tabs are only shown for external movies (credits, and saga when it has several movies)
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

	const target = movieDetails.value?.saga?.movies?.find((m) => m?.id === externalId);
	if (target) {
		target.internal_movie = internalMovie;
	}
};

// Update the movie details when the user's movie is added, edited, or removed
const _setMovieDetailsMovie = (movie?: Movie) => {
	if (movieDetails.value) {
		movieDetails.value = {
			...movieDetails.value,
			movie: movie ?? null,
			collections: movie ? movieDetails.value.collections : [],
		};
	}

	_syncSagaMovieUserEntry(routeMovieId.value, movie);
};

// Remove the movie from my list after confirmation
const { loading: isRemovingFromMyList, execute: removeFromMyList } = useLoadingWrapper(() =>
	toast.withErrorToast(async () => {
		if (!isInMyList.value) {
			return;
		}

		// Confirm the deletion of the movie
		const result = await openConfirmationModal(
			() => movieStore.deleteMovie({ id: movieDetails.value!.movie!.id }),
			{
				icon: "i-lucide-trash",
				title: "Delete this movie",
				message: "You are about to delete this movie from your list. Press confirm to proceed",
			},
		);

		if (!result) {
			return;
		}

		_setMovieDetailsMovie();

		// Go back to the main movies page in the current movie is internal
		if (isInternal.value) {
			await navigateTo("/app/movies");
		}
	}),
);

// Add the external movie to my list
const { loading: isAddingToMyList, execute: addToMyList } = useLoadingWrapper(() =>
	toast.withErrorToast(async () => {
		if (isInMyList.value) {
			return;
		}

		const movie = await movieStore.createMovieFromExternal({ externalMovieId: routeMovieId.value });
		_setMovieDetailsMovie(movie);
	}),
);

// Open the edit modal and apply the returned changes to the page
const { loading: isEditingMovie, execute: editMovie } = useLoadingWrapper(() =>
	toast.withErrorToast(async () => {
		if (!isInMyList.value) {
			return;
		}

		const instance = movieFormModal.open({ id: movieDetails.value!.movie!.id });
		const result = await instance.result;

		if (result) {
			_setMovieDetailsMovie(result.movie);
			movieDetails.value!.collections = result.collections;
		}
	}),
);

// Metadata updates: persist the new value for the user's movie
const { loading: isUpdatingStatus, execute: updateStatus } = useLoadingWrapper((newStatus: MediaStatus | undefined) =>
	toast.withErrorToast(async () => {
		if (!isInMyList.value) {
			return;
		}

		const movie = await trpc.movie.update.mutate({
			id: userMovieId.value!,
			status: newStatus ?? null,
		});

		_setMovieDetailsMovie(movie);
	}),
);

const { loading: isUpdatingCollections, execute: updateCollections } = useLoadingWrapper((collectionIds: string[]) =>
	toast.withErrorToast(async () => {
		if (!isInMyList.value) {
			return;
		}

		movieDetails.value!.collections = await trpc.media.updateCollections.mutate({
			id: userMovieId.value!,
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

			_setMovieDetailsMovie(
				await trpc.movie.update.mutate({
					id: userMovieId.value!,
					rating: newRating ?? null,
				}),
			);
		}),
	DEBOUNCE_TIMER,
);

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
		if (tmdbSagaMovie.id === routeMovieId.value) {
			_setMovieDetailsMovie(movie);
		}
	});

const removeSagaMovieFromMyList = (tmdbSagaMovie: TmdbMovieSagaMovie) =>
	toast.withErrorToast(async () => {
		// If not in my list
		const movieId = tmdbSagaMovie.internal_movie?.id;
		if (!movieId) {
			return;
		}

		const isCurrentMovie = movieId === movieDetails.value?.movie?.id;

		await movieStore.deleteMovie({ id: movieId });

		_syncSagaMovieUserEntry(tmdbSagaMovie.id, undefined);

		// If the saga movie is the current movie details
		if (isCurrentMovie) {
			_setMovieDetailsMovie();
		}
	});

// Navigate to the selected saga movie's external details page
const openSagaMovie = (tmdbMovie: TmdbMovieSagaMovie) => navigateTo({ path: `/app/movies/external/${tmdbMovie.id}` });
</script>
