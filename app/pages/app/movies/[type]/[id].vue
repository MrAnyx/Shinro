<template>
	<div class="flex gap-x-8 w-full">
		<!-- Side bar with image and actions -->
		<aside class="w-80">
			<UCard :ui="{ body: 'flex flex-col gap-y-4' }" variant="subtle">
				<!-- Image -->
				<ImageFallback
					provider="tmdb"
					:src="detailsData?.poster_path"
					:height="400"
					class="rounded-md"
					:loading="isLoading"
				/>

				<!-- Actions -->
				<template v-if="isLoading">
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
						@click="addMovie"
					/>

					<template v-else-if="isInMyList">
						<UButton
							label="Remove from My List"
							block
							leading-icon="i-lucide-trash"
							variant="subtle"
							color="error"
							@click="removeMovie"
						/>

						<UButton
							label="Edit movie"
							block
							leading-icon="i-lucide-square-pen"
							variant="subtle"
							color="info"
						/>

						<USelectMenu
							:items="collections"
							:model-value="selectedCollectionIds"
							:loading="isLoading"
							variant="subtle"
							multiple
							value-key="value"
							placeholder="Select some collections"
							leading-icon="i-lucide-folder"
							clear
							@clear="clearCollections"
							@update:model-value="updateMovieCollections"
						/>

						<UPopover :ui="{ content: 'p-3!' }">
							<UButton
								color="neutral"
								variant="subtle"
								block
								:label="ratingButtonLabel"
								leading-icon="i-lucide-user-star"
							/>

							<template #content>
								<ClearableRating
									v-model="rating"
									@update:model-value="updateRating"
									@clear="clearRating"
								/>
							</template>
						</UPopover>
					</template>
				</template>
			</UCard>
		</aside>

		<!-- Main section -->
		<main class="flex-1 min-w-0 flex flex-col gap-y-6">
			<!-- Title and tagline -->
			<div class="flex flex-col gap-y-1">
				<template v-if="isLoading">
					<USkeleton class="w-1/2 h-[32px] rounded-sm" />
					<USkeleton class="w-1/3 h-[24px] rounded-sm" />
				</template>
				<template v-else>
					<h1 class="font-bold text-4xl">
						{{ myMovie?.media.name ?? detailsData?.title ?? "No title available" }}
					</h1>
					<h3 class="italic text-muted text-sm" v-if="detailsData?.tagline">{{ detailsData?.tagline }}</h3>
				</template>
			</div>

			<!-- Details badges -->
			<div class="flex gap-x-2" v-if="isExternal">
				<template v-if="isLoading">
					<USkeleton v-for="i in 3" :key="i" class="h-[24px] w-24 rounded-sm" />
				</template>
				<template v-else>
					<UBadge color="error" variant="subtle" leading-icon="i-lucide-user-x" v-if="detailsData?.adult">
						18+
					</UBadge>

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

					<UBadge
						:color="getRatingColor(detailsData?.vote_average)"
						variant="subtle"
						leading-icon="i-lucide-star"
						v-if="detailsData?.vote_average && detailsData?.vote_count"
					>
						{{ detailsData?.vote_average?.toFixed(1) }} ({{ detailsData?.vote_count.toLocaleString() }}
						votes)
					</UBadge>

					<UBadge
						color="neutral"
						variant="subtle"
						leading-icon="i-lucide-list-video"
						v-if="detailsData?.belongs_to_collection?.name"
					>
						{{ detailsData?.belongs_to_collection?.name }}
					</UBadge>
				</template>
			</div>

			<!-- Synopsis -->
			<div class="flex flex-col gap-y-2">
				<template v-if="isLoading">
					<div class="flex flex-col gap-y-2">
						<USkeleton class="h-4 w-full rounded-sm" />
						<USkeleton class="h-4 w-full rounded-sm" />
						<USkeleton class="h-4 w-3/4 rounded-sm" />
					</div>
				</template>

				<template v-else>
					<p class="text-toned" :class="{ 'line-clamp-none': readMore, 'line-clamp-2': !readMore }">
						{{ myMovie?.overview ?? detailsData?.overview ?? "No overview available" }}
					</p>
					<UButton
						label="Read more"
						variant="link"
						class="p-0 self-start"
						@click="toggleReadMore"
						v-show="!readMore"
					/>
				</template>
			</div>

			<!-- Genres -->
			<div class="flex gap-2 flex-wrap" v-if="isExternal">
				<template v-if="isLoading">
					<USkeleton v-for="i in 3" :key="i" class="h-[24px] w-24 rounded-sm" />
				</template>
				<template v-else>
					<template v-if="genres.length > 0">
						<UBadge
							v-for="genre in genres"
							:key="genre.name"
							color="primary"
							variant="subtle"
							leading-icon="i-lucide-tag"
						>
							{{ genre.name }}
						</UBadge>
					</template>
					<UBadge v-else color="error" variant="subtle" leading-icon="i-lucide-tag-x">
						No genres available
					</UBadge>
				</template>
			</div>

			<!-- Note -->
			<UAlert
				title="Personal note"
				:description="note"
				icon="i-lucide-notebook-pen"
				color="neutral"
				variant="subtle"
				v-if="note && !isLoading"
			/>

			<USeparator v-if="isExternal" />

			<!-- Credits -->
			<div v-if="isExternal">
				<h2 class="font-bold text-xl mb-3">Credits</h2>

				<div class="flex gap-x-3 overflow-x-auto pb-2">
					<template v-if="isLoading">
						<USkeleton v-for="i in 4" :key="i" class="w-[170px] h-[270px] rounded-sm shrink-0" />
					</template>
					<template v-else-if="actors.length > 0">
						<template v-for="(actor, index) in actors" :key="index">
							<UCard class="w-[170px] shrink-0" :ui="{ body: 'p-0!' }" variant="subtle">
								<NuxtLink
									class="flex flex-col"
									:to="`https://www.themoviedb.org/person/${actor.id}`"
									target="_blank"
								>
									<ImageFallback provider="tmdb" :src="actor.profile_path" :height="210" />

									<div class="p-2">
										<p class="font-semibold text-center line-clamp-1">
											{{ actor.name ?? "No name" }}
										</p>
										<p class="text-sm text-muted text-center line-clamp-1">
											{{ actor.character ?? "No character" }}
										</p>
									</div>
								</NuxtLink>
							</UCard>
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

definePageMeta({
	layout: "app",
	middleware: ["auth"],
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

// Computed
const type = computed(() => route.params.type as MediaSourceType);
const id = computed(() => route.params.id as string);
const isExternal = computed(() => type.value === MediaSourceTypes.external);
const isInternal = computed(() => type.value === MediaSourceTypes.internal);
const isReleased = computed(() => {
	if (!detailsData.value?.release_date) {
		return false;
	}
	return new Date(detailsData.value.release_date) <= new Date();
});
const genres = computed(() => detailsData.value?.genres?.filter((g): g is { name: string } => !!g.name?.trim()) ?? []);
const actors = computed(() => creditsData.value?.cast?.slice(0, MAX_CREDITS) ?? []);
const isLoading = computed(
	() =>
		loadingDetails.value ||
		loadingMyMovie.value ||
		loadingCollections.value ||
		loadingCredits.value ||
		loadingMovieCollections.value,
);
const isInMyList = computed(() => !!myMovie.value);
const collections = computed<SelectMenuItem[]>(
	() =>
		collectionsData.value?.results.map(
			(x) =>
				({
					label: x.name,
					value: x.id,
					icon: x.favorite ? "i-ph-star-fill" : undefined,
					ui: {
						itemLeadingIcon: x.favorite ? "text-warning" : undefined,
					},
				}) as SelectMenuItem,
		) ?? [],
);
const ratingButtonLabel = computed(() =>
	rating.value ? `Edit my rating (${rating.value.toFixed(1)})` : `Set my rating`,
);
const note = computed(() => myMovie.value?.media.note ?? "");

// State
const readMore = ref(false);
const rating = ref<number | undefined>(undefined);
const selectedCollectionIds = ref<string[]>([]);

const myMovie = ref<MovieWithMediaView | null | undefined>(null);

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
	myMovie.value = newValue;
	rating.value = newValue?.media.rating ?? undefined;
});

const { data: movieCollections, pending: loadingMovieCollections } = useAsyncData("movie-collections", async () => {
	if (isInternal.value) {
		return await trpc.movie.getCollections.query({ id: id.value });
	} else if (isExternal.value) {
		return await trpc.movie.getCollections.query({ externalId: id.value });
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

		await movieStore.deleteMovie({ id: myMovie.value!.id });
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
		if (myMovie.value || isInMyList.value) {
			return;
		}

		const movie = await movieStore.createMovieFromExternal({ externalId: id.value });
		myMovie.value = movie;
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

const updateMovieCollections = async (collectionIds: string[]) => {
	if (!isInMyList.value) {
		return;
	}

	selectedCollectionIds.value = collectionIds;

	try {
		await trpc.movie.updateCollections.mutate({
			id: myMovie.value!.id,
			collectionIds,
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

const clearCollections = async () => {
	if (!isInMyList.value) {
		return;
	}

	await updateMovieCollections([]);
};

const updateRating = async (newRating: number | null) => {
	try {
		if (!isInMyList.value) {
			return;
		}

		await trpc.movie.update.mutate({
			id: myMovie.value!.id,
			rating: newRating,
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

const clearRating = async () => {
	try {
		if (!isInMyList.value) {
			return;
		}

		rating.value = undefined;

		await trpc.movie.update.mutate({
			id: myMovie.value!.id,
			rating: null,
		});
	} catch (err: any) {
		const message = isTRPCError(err) ? err.message : "Unknown error";
		toast.add({
			title: "Unable to reset the rating",
			description: message,
			color: "error",
			type: "foreground",
		});
	}
};

const toggleReadMore = () => {
	readMore.value = !readMore.value;
};
</script>
