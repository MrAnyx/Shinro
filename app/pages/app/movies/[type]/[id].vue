<template>
	<div class="flex gap-8 w-full">
		<!-- Side bar with image and actions -->
		<DetailsAside
			class="w-80"
			:loading="isLoading"
			:external="isExternal"
			:in-my-list="isInMyList"
			image-provider="tmdb"
			:image="tmdbMovieDetails?.details.poster_path ?? undefined"
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
			<DetailsTitleHeader
				:loading="isLoading"
				:title="myMovieDetails?.media.name ?? tmdbMovieDetails?.details.title ?? undefined"
				:subtitle="tmdbMovieDetails?.details.tagline ?? undefined"
			/>

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

			<!-- Credits -->
			<UTabs :items="tabs" variant="link">
				<template #credits>
					<DetailsCreditCards
						:credits="credits"
						image-provider="tmdb"
						:loading="isLoading"
						:show-more-to="`https://www.themoviedb.org/movie/${id}/cast`"
						:credit-card-to-fn="(credit) => `https://www.themoviedb.org/person/${credit.id}`"
					/>
				</template>
				<template #saga>
					<UCard :ui="{ body: 'p-0! h-full' }" class="h-full">
						<UTable :data="sagaMovies" :columns="sagaColumns" @select="onSagaMovieSelected">
							<template #title-cell="{ row }">
								<span>{{ row.original.internal_movie?.media.name ?? row.original.title }}</span>
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
							<template #release_date-cell="{ row }">
								<NuxtTime
									v-if="row.original.release_date"
									:datetime="row.original.release_date"
									year="numeric"
									month="short"
									day="numeric"
									timezone="UTC"
								/>
							</template>
							<template #vote_average-cell="{ row }">
								<VoteBadge :score="row.original.vote_average" :count="row.original.vote_count" />
							</template>
							<template #actions-cell="{ row }">
								<ToggleButton
									variant="ghost"
									:is-added="!!row.original.internal_movie"
									:on-add="() => addSagaMovieToMyList(row)"
									:on-remove="() => removeSagaMovieFromMyList(row)"
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
import type { TabsItem, TableColumn, TableRow } from "@nuxt/ui";

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

// Route + page state
const type = computed(() => route.params.type as MediaSourceType);
const id = computed(() => route.params.id as string);
const isExternal = computed(() => type.value === MediaSourceTypes.external);
const isInternal = computed(() => type.value === MediaSourceTypes.internal);
const mediaQueryParams = computed(() =>
	isInternal.value ? { id: id.value } : isExternal.value ? { externalId: id.value } : null,
);

// Derived UI state
const genres = computed(
	() =>
		tmdbMovieDetails.value?.details.genres
			?.filter((g): g is { name: string } => !!g.name?.trim())
			.map((g) => g.name) ?? [],
);
const isLoading = computed(() => loadingDetails.value || loadingMyMovie.value || loadingMovieCollections.value);
const isInMyList = computed(() => !!myMovieDetails.value);
const note = computed(() => myMovieDetails.value?.media.note ?? undefined);
const credits = computed(() => tmdbMovieDetails.value?.credits.cast ?? []);
const hasSaga = computed(() => !!tmdbMovieDetails.value?.saga);
const sagaName = computed(() => tmdbMovieDetails.value?.saga?.name ?? "Unknown");

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
	...(isExternal.value && hasSaga.value
		? [
				{
					icon: "i-lucide-list-video",
					label: `Saga (${sagaName.value})`,
					slot: "saga",
				},
			]
		: []),
]);

// Table config
const sagaColumns: TableColumn<TmdbMovieCollectionPartDefaultView>[] = [
	{
		id: "image",
		meta: {
			class: {
				td: "w-[60px]",
			},
		},
	},
	{
		id: "title",
		header: "Title",
		meta: {
			class: {
				td: "max-w-[120px] truncate font-bold text-default",
			},
		},
	},
	{
		accessorFn: (x) => x.internal_movie?.overview ?? x.overview,
		header: "Synopsis",
		meta: {
			class: {
				td: "max-w-[300px] truncate",
			},
		},
	},
	{
		id: "adult",
		header: "Category",
		meta: {
			class: {
				th: "w-0 whitespace-nowrap",
				td: "w-0 whitespace-nowrap",
			},
		},
	},
	{
		id: "release_date",
		header: "Released At",
		meta: {
			class: {
				th: "w-0 whitespace-nowrap",
				td: "w-0 whitespace-nowrap",
			},
		},
	},
	{
		id: "vote_average",
		header: "Vote",
		meta: {
			class: {
				th: "w-0 whitespace-nowrap",
				td: "w-0 whitespace-nowrap",
			},
		},
	},
	{
		id: "actions",
		meta: {
			class: {
				th: "w-0 whitespace-nowrap",
				td: "w-0 whitespace-nowrap",
			},
		},
	},
];

// Local reactive state
const rating = ref<number | undefined>(undefined);
const selectedCollectionIds = ref<string[]>([]);
const status = ref<MediaStatus | undefined>(undefined);
const sagaMovies = ref<TmdbMovieCollectionPartDefaultView[]>([]);

// Async data loading
const { data: myMovieDetails, pending: loadingMyMovie } = useClientAsyncData(
	async () => {
		const params = mediaQueryParams.value;
		return params ? trpc.movie.getById.query(params) : undefined;
	},
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

const { data: tmdbMovieDetails, pending: loadingDetails } = useClientAsyncData(
	() => trpc.tmdbMovie.details.query({ id: id.value }),
	{ enabled: () => isExternal.value },
);

watch(tmdbMovieDetails, (newValue) => {
	sagaMovies.value = newValue?.saga?.parts?.filter((p) => p.media_type === "movie") ?? [];
});

const { data: myMovieCollections, pending: loadingMovieCollections } = useClientAsyncData(
	async () => {
		const params = mediaQueryParams.value;
		return params ? trpc.media.getCollections.query(params) : undefined;
	},
	{
		ignoreError: (err) => getTRPCErrorCode(err) === "NOT_FOUND",
	},
);

watch(myMovieCollections, (newValue) => {
	selectedCollectionIds.value = newValue?.map((x) => x.id) ?? [];
});

// Movie lifecycle actions
const movieFormModal = overlay.create(LazyMovieFormModal);

const removeMovie = async () => {
	try {
		if (!isInMyList.value) {
			return;
		}

		await movieStore.deleteMovie({ id: myMovieDetails.value!.id });
		myMovieDetails.value = undefined;

		if (isInternal.value) {
			await navigateTo("/app/movies");
		}
	} catch (err: any) {
		toast.error(err);
	}
};

const addMovie = async () => {
	try {
		if (myMovieDetails.value || isInMyList.value) {
			return;
		}

		const movie = await movieStore.createMovieFromExternal({ externalId: id.value });
		myMovieDetails.value = movie;
		updateSagaMovieInternalMovie(id.value, movie);
	} catch (err: any) {
		toast.error(err);
	}
};

const editMovie = async () => {
	if (!isInMyList.value) {
		return;
	}

	const instance = movieFormModal.open({ id: myMovieDetails.value!.id });
	const result = await instance.result;

	if (result) {
		myMovieDetails.value = result.movie;
		selectedCollectionIds.value = result.collections.map((c) => c.id);
		updateSagaMovieInternalMovie(result.movie.media.externalId ?? undefined, result.movie);
	}
};

// Metadata updates
const updateStatus = async (status?: MediaStatus) => {
	if (!isInMyList.value) {
		return;
	}

	try {
		await trpc.movie.update.mutate({
			id: myMovieDetails.value!.id,
			status: status ?? null,
		});
	} catch (err: any) {
		toast.error(err);
	}
};

const updateCollections = async () => {
	if (!isInMyList.value) {
		return;
	}

	try {
		await trpc.media.updateCollections.mutate({
			id: myMovieDetails.value!.id,
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
			id: myMovieDetails.value!.id,
			rating: rating.value ?? null,
		});
	} catch (err: any) {
		toast.error(err);
	}
};

// Saga helpers
const updateSagaMovieInternalMovie = (externalId?: string, internalMovie?: MovieWithMediaView) => {
	const target = sagaMovies.value.find((m) => m.id === externalId);
	if (target) {
		target.internal_movie = internalMovie;
	}
};

const addSagaMovieToMyList = async (row: TableRow<TmdbMovieCollectionPartDefaultView>) => {
	try {
		const movie = await movieStore.createMovieFromExternal({ externalId: row.original.id });

		updateSagaMovieInternalMovie(row.original.id, movie);
		toast.success({ description: `${movie.media.name} has been added to your list` });
	} catch (err: any) {
		toast.error(err);
	}
};

const removeSagaMovieFromMyList = async (row: TableRow<TmdbMovieCollectionPartDefaultView>) => {
	try {
		if (!row.original.internal_movie?.id) {
			return;
		}

		await movieStore.deleteMovie({ id: row.original.internal_movie.id });
		updateSagaMovieInternalMovie(row.original.id, undefined);
		toast.success({ description: `${row.original.title} has been removed from your list` });
	} catch (err: any) {
		toast.error(err);
	}
};

const onSagaMovieSelected = async (_event: Event, row: TableRow<TmdbMovieCollectionPartDefaultView>) => {
	await navigateTo({ path: `/app/movies/external/${row.original.id}` });
};
</script>
