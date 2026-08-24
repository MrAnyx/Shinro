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
			:image="detailsData?.poster_path"
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
				:title="movieData?.media.name ?? detailsData?.title"
				:subtitle="detailsData?.tagline"
			/>

			<!-- Details badges -->
			<div class="flex gap-2 flex-wrap" v-if="isExternal">
				<template v-if="isLoading">
					<USkeleton v-for="i in 3" :key="i" class="h-[24px] w-24 rounded-sm" />
				</template>
				<template v-else>
					<AdultBadge :adult="detailsData?.adult" />

					<UBadge
						color="neutral"
						variant="subtle"
						leading-icon="i-lucide-calendar"
						v-if="detailsData?.release_date"
					>
						<NuxtTime :datetime="detailsData?.release_date" year="numeric" month="short" day="numeric" />
					</UBadge>

					<UBadge
						:color="isReleased ? 'success' : 'warning'"
						variant="subtle"
						:leading-icon="isReleased ? 'i-lucide-check' : 'i-lucide-clock'"
					>
						{{ isReleased ? "Released" : "Upcoming" }}
					</UBadge>

					<UBadge color="neutral" variant="subtle" leading-icon="i-lucide-clock" v-if="detailsData?.runtime">
						{{ Math.floor(detailsData?.runtime / 60) }}:{{
							(detailsData?.runtime % 60).toString().padStart(2, "0")
						}}
					</UBadge>

					<VoteBadge
						v-if="detailsData?.vote_average && detailsData?.vote_count"
						:average="detailsData.vote_average"
						:count="detailsData.vote_count"
					/>
				</template>
			</div>

			<!-- Synopsis -->
			<DetailsOverview :loading="isLoading" :overview="movieData?.overview ?? detailsData?.overview" />

			<!-- Genres -->
			<DetailsGenreBadges :loading="isLoading" v-if="isExternal" :genres="genres" />

			<!-- Note -->
			<DetailsPersonalNote :description="note" v-if="note && !isLoading" />

			<!-- Credits -->
			<div v-if="isExternal">
				<h2 class="font-bold text-xl mb-3">Credits</h2>

				<div class="flex gap-x-3 overflow-x-auto pb-2">
					<template v-if="isLoading">
						<USkeleton v-for="i in 4" :key="i" class="w-[170px] h-[270px] rounded-sm shrink-0" />
					</template>
					<template v-else-if="actors.length > 0">
						<template v-for="(actor, index) in actors" :key="index">
							<DetailsCreditCard
								:to="`https://www.themoviedb.org/person/${actor.id}`"
								:image="actor.profile_path"
								:name="actor.name"
								:character="actor.character"
								image-provider="tmdb"
							/>
						</template>
						<UCard
							class="w-[170px] shrink-0"
							:ui="{ body: 'p-0! flex justify-center items-center h-full' }"
							variant="subtle"
							v-if="(creditsData?.cast?.length ?? 0) > MAX_CREDITS"
						>
							<NuxtLink
								class="flex flex-col gap-y-2 items-center justify-center h-full"
								:to="`https://www.themoviedb.org/movie/${id}/cast`"
								target="_blank"
							>
								<UAvatar icon="i-lucide-external-link" size="xl" color="primary" />
								<span class="text-toned">View all</span>
								<span class="text-muted text-xs"
									>{{ creditsData?.cast?.length ?? 0 }} cast members</span
								>
							</NuxtLink>
						</UCard>
					</template>

					<p class="text-sm text-muted" v-else>No credits available</p>
				</div>
			</div>
		</main>
	</div>
</template>
<script setup lang="ts">
import type { SelectMenuItem } from "@nuxt/ui";

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
const toast = useToast();
const overlay = useOverlay();

// Computed
const type = computed(() => route.params.type as MediaSourceType);
const id = computed(() => route.params.id as string);
const isExternal = computed(() => type.value === MediaSourceTypes.external);
const isInternal = computed(() => type.value === MediaSourceTypes.internal);
const isReleased = computed(() => {
	if (!detailsData.value?.release_date) {
		return false;
	}

	try {
		return new Date(detailsData.value.release_date) <= new Date();
	} catch {
		return false;
	}
});
const genres = computed(
	() => detailsData.value?.genres?.filter((g): g is { name: string } => !!g.name?.trim()).map((g) => g.name) ?? [],
);
const actors = computed(() => creditsData.value?.cast?.slice(0, MAX_CREDITS) ?? []);
const isLoading = computed(
	() =>
		loadingDetails.value ||
		loadingMyMovie.value ||
		loadingCollections.value ||
		loadingCredits.value ||
		loadingMovieCollections.value,
);
const isInMyList = computed(() => !!movieData.value);

const note = computed(() => movieData.value?.media.note ?? "");

// State
const rating = ref<number | undefined>(undefined);
const selectedCollectionIds = ref<string[]>([]);
const status = ref<MediaStatus | undefined>(undefined);

// Async data
const { data: detailsData, pending: loadingDetails } = useAsyncData("movie-details", async () =>
	isExternal.value ? await trpc.tmdbMovie.details.query({ id: id.value }) : null,
);

const { data: movieData, pending: loadingMyMovie } = useAsyncData("movie-from-external", async () => {
	if (isInternal.value) {
		return await trpc.movie.getById.query({ id: id.value });
	} else if (isExternal.value) {
		return await trpc.movie.getById.query({ externalId: id.value });
	} else {
		return null;
	}
});

watch(movieData, (newValue) => {
	rating.value = newValue?.media.rating ?? undefined;
	status.value = newValue?.media.status ?? undefined;
});

const { data: movieCollections, pending: loadingMovieCollections } = useAsyncData("movie-collections", async () => {
	if (isInternal.value) {
		return await trpc.media.getCollections.query({ id: id.value });
	} else if (isExternal.value) {
		return await trpc.media.getCollections.query({ externalId: id.value });
	} else {
		return null;
	}
});

watch(movieCollections, (newValue) => {
	selectedCollectionIds.value = newValue?.map((x) => x.id) ?? [];
});

const { data: collectionsData, pending: loadingCollections } = useAsyncData(
	"collections",
	async () =>
		await trpc.collection.getAll.query({
			force: true,
			orderBy: [
				{ sort: "favorite", order: "desc" },
				{ sort: "name", order: "asc" },
			],
		}),
);

const { data: creditsData, pending: loadingCredits } = useAsyncData(
	"credits",
	async () => await trpc.tmdbMovie.credits.query({ id: id.value }),
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
		const message = isTRPCError(err) ? err.message : "Unknown error";
		toast.add({
			title: "Unable to remove a movie",
			description: message,
			color: "error",
			type: "foreground",
		});
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
		const message = isTRPCError(err) ? err.message : "Unknown error";
		toast.add({
			title: "Unable to add a movie",
			description: message,
			color: "error",
			type: "foreground",
		});
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
		const message = isTRPCError(err) ? err.message : "Unknown error";
		toast.add({
			title: "Unable to update status",
			description: message,
			color: "error",
			type: "foreground",
		});
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
		const message = isTRPCError(err) ? err.message : "Unknown error";
		toast.add({
			title: "Unable to update collections",
			description: message,
			color: "error",
			type: "foreground",
		});
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
		const message = isTRPCError(err) ? err.message : "Unknown error";
		toast.add({
			title: "Unable to set the rating",
			description: message,
			color: "error",
			type: "foreground",
		});
	}
};
</script>
