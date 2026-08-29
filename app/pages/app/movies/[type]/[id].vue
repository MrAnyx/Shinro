<template>
	<div class="flex gap-8 w-full">
		<!-- Side bar with image and actions -->
		<DetailsAside
			class="w-80"
			:loading="isLoading"
			:collections-available="collectionsData?.results"
			:external="isExternal"
			:in-my-list="isInMyList"
			image-provider="tmdb"
			:image="detailsData?.poster_path ?? undefined"
			v-model:rating="rating"
			v-model:status="status"
			v-model:collections="selectedCollectionIds"
			@add="addMovie"
			@remove="removeMovie"
			@edit="editMovie"
			@update:status="updateStatus"
			@update:collections="updateMovieCollections"
			@update:rating="updateRating"
		/>

		<!-- Main section -->
		<main class="flex-1 min-w-0 flex flex-col gap-y-6">
			<!-- Title and tagline -->
			<DetailsTitleHeader
				:loading="isLoading"
				:title="movieData?.media.name ?? detailsData?.title ?? undefined"
				:subtitle="detailsData?.tagline ?? undefined"
			/>

			<!-- Details badges -->
			<div class="flex gap-2 flex-wrap" v-if="isExternal">
				<template v-if="isLoading">
					<USkeleton v-for="i in 3" :key="i" class="h-[24px] w-24 rounded-sm" />
				</template>
				<template v-else>
					<AdultBadge :adult="detailsData?.adult" />
					<DetailsDateBadge :date="detailsData?.release_date ?? undefined" />
					<DetailsReleaseBadge :start-date="detailsData?.release_date ?? undefined" />
					<DetailsDurationBadge :duration="detailsData?.runtime" />
					<VoteBadge :average="detailsData?.vote_average ?? 0" :count="detailsData?.vote_count ?? 0" />
				</template>
			</div>

			<!-- Synopsis -->
			<DetailsOverview
				:loading="isLoading"
				:overview="movieData?.overview ?? detailsData?.overview ?? undefined"
			/>

			<!-- Genres -->
			<DetailsGenreBadges :loading="isLoading" v-if="isExternal" :genres="genres" />

			<!-- Note -->
			<DetailsPersonalNote :description="note" v-if="note && !isLoading" />

			<!-- Credits -->
			<UTabs :items="tabs" variant="link">
				<template #credits>
					<DetailsCreditCards
						:credits="creditsData?.cast ?? undefined"
						image-provider="tmdb"
						:loading="isLoading"
						:show-more-to="`https://www.themoviedb.org/movie/${id}/cast`"
						:credit-card-to-fn="(credit) => `https://www.themoviedb.org/person/${credit.id}`"
					/>
				</template>
			</UTabs>
		</main>
	</div>
</template>
<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";

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

// Computed
const type = computed(() => route.params.type as MediaSourceType);
const id = computed(() => route.params.id as string);
const isExternal = computed(() => type.value === MediaSourceTypes.external);
const isInternal = computed(() => type.value === MediaSourceTypes.internal);
const genres = computed(
	() => detailsData.value?.genres?.filter((g): g is { name: string } => !!g.name?.trim()).map((g) => g.name) ?? [],
);
const isLoading = computed(
	() =>
		loadingDetails.value ||
		loadingMyMovie.value ||
		loadingCollections.value ||
		loadingCredits.value ||
		loadingMovieCollections.value,
);
const isInMyList = computed(() => !!movieData.value);
const note = computed(() => movieData.value?.media.note);

const mediaQueryParams = computed(() =>
	isInternal.value ? { id: id.value } : isExternal.value ? { externalId: id.value } : null,
);

const tabs = computed<TabsItem[]>(() => [
	...(isExternal.value
		? [
				{
					icon: "i-lucide-users",
					label: "Credits",
					slot: "credits",
				},
			]
		: []),
	...(isExternal.value
		? [
				{
					icon: "i-lucide-list-video",
					label: "Saga",
					slot: "saga",
				},
			]
		: []),
]);
// State
const rating = ref<number | undefined>(undefined);
const selectedCollectionIds = ref<string[]>([]);
const status = ref<MediaStatus | undefined>(undefined);

// Async data
const { data: detailsData, pending: loadingDetails } = useSafeAsyncData(async () =>
	isExternal.value ? trpc.tmdbMovie.details.query({ id: id.value }) : null,
);

const { data: movieData, pending: loadingMyMovie } = useSafeAsyncData(async () => {
	const params = mediaQueryParams.value;
	return params ? trpc.movie.getById.query(params) : null;
});

watch(movieData, (newValue) => {
	rating.value = newValue?.media.rating ?? undefined;
	status.value = newValue?.media.status ?? undefined;
});

const { data: movieCollections, pending: loadingMovieCollections } = useSafeAsyncData(async () => {
	const params = mediaQueryParams.value;
	return params ? trpc.media.getCollections.query(params) : null;
});

watch(movieCollections, (newValue) => {
	selectedCollectionIds.value = newValue?.map((x) => x.id) ?? [];
});

const { data: collectionsData, pending: loadingCollections } = useSafeAsyncData(() =>
	trpc.collection.getAll.query({
		force: true,
		orderBy: [
			{ sort: "favorite", order: "desc" },
			{ sort: "name", order: "asc" },
		],
	}),
);

const { data: creditsData, pending: loadingCredits } = useSafeAsyncData(() =>
	trpc.tmdbMovie.credits.query({ id: id.value }),
);

// Methods
const removeMovie = async () => {
	try {
		if (!isInMyList.value) {
			return;
		}

		await movieStore.deleteMovie({ id: movieData.value!.id });
		movieData.value = null;

		if (isInternal.value) {
			await navigateTo("/app/movies");
		}
	} catch (err: any) {
		toast.error(err);
	}
};

const addMovie = async () => {
	try {
		if (movieData.value || isInMyList.value) {
			return;
		}

		const movie = await movieStore.createMovieFromExternal({ externalId: id.value });
		movieData.value = movie;
	} catch (err: any) {
		toast.error(err);
	}
};

const movieFormModal = overlay.create(LazyMovieFormModal);
const editMovie = async () => {
	if (!isInMyList.value) {
		return;
	}

	const instance = movieFormModal.open({ movie: movieData.value! });

	const result = await instance.result;

	if (result) {
		movieData.value = result;
	}
};

const updateStatus = async (status?: MediaStatus) => {
	if (!isInMyList.value) {
		return;
	}

	try {
		await trpc.movie.update.mutate({
			id: movieData.value!.id,
			status: status ?? null,
		});
	} catch (err: any) {
		toast.error(err);
	}
};

const updateMovieCollections = async () => {
	if (!isInMyList.value) {
		return;
	}

	try {
		await trpc.media.updateCollections.mutate({
			id: movieData.value!.id,
			collectionIds: selectedCollectionIds.value,
		});
	} catch (err: any) {
		toast.error(err);
	}
};

const updateRating = async () => {
	try {
		if (!isInMyList.value) {
			return;
		}

		await trpc.movie.update.mutate({
			id: movieData.value!.id,
			rating: rating.value ?? null,
		});
	} catch (err: any) {
		toast.error(err);
	}
};
</script>
