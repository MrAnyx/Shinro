<template>
	<div class="flex gap-x-8 w-full">
		<!-- Side bar with image and actions -->
		<aside class="w-80">
			<UCard :ui="{ body: 'flex flex-col gap-y-4' }" variant="subtle">
				<!-- Image -->
				<ImageFallback
					provider="tmdb"
					:src="mediaData?.media.imagePath"
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
						@click="handleAdd"
					/>

					<template v-else-if="isInMyList">
						<UButton
							label="Remove from My List"
							block
							leading-icon="i-lucide-trash"
							variant="subtle"
							color="error"
							@click="handleRemove"
						/>

						<UButton
							label="Edit media"
							block
							leading-icon="i-lucide-square-pen"
							variant="subtle"
							color="info"
							@click="handleEdit"
						/>

						<StatusSelectMenu
							:loading="isLoading"
							@update:modelValue="updateStatus"
							variant="subtle"
							v-model="status"
						/>

						<USelectMenu
							:items="collections"
							v-model="selectedCollectionIds"
							:loading="isLoading"
							variant="subtle"
							multiple
							value-key="value"
							placeholder="Select some collections"
							leading-icon="i-lucide-folder"
							clear
							@clear="clearCollections"
							@update:model-value="updateCollections"
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
									@update:model-value="(v) => updateRating(v ?? null)"
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
			<!-- Type-specific details -->
			<component
				:is="detailComponent"
				:media-data="mediaData"
				:details-data="detailsData"
				:is-loading="isLoading"
				:is-external="isExternal"
			/>

			<!-- Note -->
			<UAlert
				title="Personal note"
				:description="note"
				icon="i-lucide-notebook-pen"
				color="neutral"
				variant="subtle"
				v-if="note && !isLoading"
			/>

			<USeparator v-if="isExternal && hasCredits" />

			<!-- Credits -->
			<MediaCreditsSection
				v-if="isExternal && hasCredits"
				:credits-data="creditsData"
				:is-loading="isLoading"
				:is-external="isExternal"
				:media-type="mediaType"
				:id="id"
			/>
		</main>
	</div>
</template>

<script setup lang="ts">
import type { SelectMenuItem } from "@nuxt/ui";
import type { Component } from "vue";

import { MediaType, MediaStatus } from "#prisma/enums";
import { LazyMovieFormModal, LazySerieFormModal } from "#components";

// Define media type to component mapping
const mediaTypeToComponent: Record<MediaType, Component> = {
	[MediaType.MOVIE]: defineAsyncComponent(() => import("@/components/media/MovieDetails.vue")),
	[MediaType.SERIE]: defineAsyncComponent(() => import("@/components/media/SerieDetails.vue")),
	[MediaType.BOOK]: defineAsyncComponent(() => import("@/components/media/BookDetails.vue")),
	[MediaType.MUSIC]: defineAsyncComponent(() => import("@/components/media/MusicDetails.vue")),
	[MediaType.GAME]: defineAsyncComponent(() => import("@/components/media/GameDetails.vue")),
	[MediaType.SEASON]: defineAsyncComponent(() => import("@/components/media/MovieDetails.vue")),
	[MediaType.EPISODE]: defineAsyncComponent(() => import("@/components/media/MovieDetails.vue")),
};

// Map route type to media type
const routeTypeToMediaType: Record<string, MediaType> = {
	movies: MediaType.MOVIE,
	series: MediaType.SERIE,
	books: MediaType.BOOK,
	music: MediaType.MUSIC,
	games: MediaType.GAME,
};

const MAX_CREDITS = 4;

definePageMeta({
	validate(route) {
		return (
			typeof route.params.type === "string" &&
			(Object.values(MediaSourceTypes) as string[]).includes(route.params.type) &&
			typeof route.params.id === "string"
		);
	},
});

// Composables
const route = useRoute();
const trpc = useTrpc();
const toast = useToast();
const overlay = useOverlay();

// Computed
const type = computed(() => route.params.type as MediaSourceType);
const id = computed(() => route.params.id as string);
const mediaType = computed(() => routeTypeToMediaType[route.params.type as string] || MediaType.MOVIE);
const isExternal = computed(() => type.value === MediaSourceTypes.external);
const isInternal = computed(() => type.value === MediaSourceTypes.internal);
const isLoading = computed(
	() =>
		loadingDetails.value ||
		loadingMedia.value ||
		loadingCollections.value ||
		loadingCredits.value ||
		loadingMediaCollections.value,
);

const detailComponent = computed(() => mediaTypeToComponent[mediaType.value] || mediaTypeToComponent[MediaType.MOVIE]);

const isInMyList = computed(() => !!mediaData.value);
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
const note = computed(() => mediaData.value?.media.note ?? "");
const hasCredits = computed(() => [MediaType.MOVIE, MediaType.SERIE].includes(mediaType.value));

// State
const readMore = ref(false);
const rating = ref<number | undefined>(undefined);
const selectedCollectionIds = ref<string[]>([]);
const status = ref<MediaStatus | undefined>(undefined);

// Async data - use type-specific routers
const { data: detailsData, pending: loadingDetails } = useAsyncData(
	"media-details",
	async () => {
		if (!isExternal.value) return null;
		
		if (mediaType.value === MediaType.MOVIE) {
			return await trpc.tmdbMovie.details.query({ id: id.value });
		} else if (mediaType.value === MediaType.SERIE) {
			return await trpc.tmdbSerie.details.query({ id: id.value });
		}
		return null;
	},
);

const { data: mediaData, pending: loadingMedia } = useAsyncData(
	"media-from-external",
	async () => {
		if (mediaType.value === MediaType.MOVIE) {
			if (isInternal.value) {
				return await trpc.movie.getById.query({ id: id.value });
			} else if (isExternal.value) {
				return await trpc.movie.getById.query({ externalId: id.value });
			}
		} else if (mediaType.value === MediaType.SERIE) {
			if (isInternal.value) {
				return await trpc.serie.getById.query({ id: id.value });
			} else if (isExternal.value) {
				return await trpc.serie.getById.query({ externalId: id.value });
			}
		}
		return null;
	},
);

watch(mediaData, (newValue) => {
	rating.value = newValue?.media.rating ?? undefined;
	status.value = newValue?.media.status ?? undefined;
});

const { data: mediaCollections, pending: loadingMediaCollections } = useAsyncData(
	"media-collections",
	async () => {
		if (mediaType.value === MediaType.MOVIE) {
			if (isInternal.value) {
				return await trpc.movie.getCollections.query({ id: id.value });
			} else if (isExternal.value) {
				return await trpc.movie.getCollections.query({ externalId: id.value });
			}
		} else if (mediaType.value === MediaType.SERIE) {
			if (isInternal.value) {
				return await trpc.serie.getCollections.query({ id: id.value });
			} else if (isExternal.value) {
				return await trpc.serie.getCollections.query({ externalId: id.value });
			}
		}
		return null;
	},
);

watch(mediaCollections, (newValue) => {
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
	async () => {
		if (mediaType.value === MediaType.MOVIE) {
			return await trpc.tmdbMovie.credits.query({ id: id.value });
		} else if (mediaType.value === MediaType.SERIE) {
			return await trpc.tmdbSerie.credits.query({ id: id.value });
		}
		return null;
	},
);

// Methods
const handleAdd = async () => {
	try {
		if (mediaData.value || isInMyList.value) {
			return;
		}

		if (mediaType.value === MediaType.MOVIE) {
			const media = await trpc.movie.createFromExternal.mutate({ externalId: id.value });
			mediaData.value = media;
		} else if (mediaType.value === MediaType.SERIE) {
			const media = await trpc.serie.createFromExternal.mutate({ externalId: id.value });
			mediaData.value = media;
		}
	} catch (err: any) {
		const message = isTRPCError(err) ? err.message : "Unknown error";
		toast.add({
			title: `Unable to add ${mediaType.value}`,
			description: message,
			color: "error",
			type: "foreground",
		});
	}
};

const handleRemove = async () => {
	try {
		if (!isInMyList.value) {
			return;
		}

		if (mediaType.value === MediaType.MOVIE) {
			const movieStore = useMovieStore();
			await movieStore.deleteMovie({ id: mediaData.value!.id });
			mediaData.value = null;
		} else if (mediaType.value === MediaType.SERIE) {
			const serieStore = useSerieStore();
			await serieStore.deleteSerie({ id: mediaData.value!.id });
			mediaData.value = null;
		}

		if (isInternal.value) {
			await navigateTo(`/app/${route.params.type}`);
		}
	} catch (err: any) {
		const message = isTRPCError(err) ? err.message : "Unknown error";
		toast.add({
			title: `Unable to remove ${mediaType.value}`,
			description: message,
			color: "error",
			type: "foreground",
		});
	}
};

const handleEdit = async () => {
	if (!isInMyList.value) {
		return;
	}

	if (mediaType.value === MediaType.MOVIE) {
		const movieFormModal = overlay.create(LazyMovieFormModal);
		const instance = movieFormModal.open({ movie: mediaData.value! });
		const result = await instance.result;
		if (result) {
			mediaData.value = result;
		}
	} else if (mediaType.value === MediaType.SERIE) {
		const serieFormModal = overlay.create(LazySerieFormModal);
		const instance = serieFormModal.open({ serie: mediaData.value! });
		const result = await instance.result;
		if (result) {
			mediaData.value = result;
		}
	}
};

const updateStatus = async (newStatus?: MediaStatus) => {
	if (!isInMyList.value) {
		return;
	}

	try {
		if (mediaType.value === MediaType.MOVIE) {
			await trpc.movie.update.mutate({
				id: mediaData.value!.id,
				status: newStatus ?? null,
			});
		} else if (mediaType.value === MediaType.SERIE) {
			await trpc.serie.update.mutate({
				id: mediaData.value!.id,
				status: newStatus ?? null,
			});
		}
		status.value = newStatus;
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

const updateCollections = async (collectionIds: string[]) => {
	if (!isInMyList.value) {
		return;
	}

	selectedCollectionIds.value = collectionIds;

	try {
		if (mediaType.value === MediaType.MOVIE) {
			await trpc.movie.updateCollections.mutate({
				id: mediaData.value!.id,
				collectionIds,
			});
		} else if (mediaType.value === MediaType.SERIE) {
			await trpc.serie.updateCollections.mutate({
				id: mediaData.value!.id,
				collectionIds,
			});
		}
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

	await updateCollections([]);
};

const updateRating = async (newRating: number | null) => {
	try {
		if (!isInMyList.value) {
			return;
		}

		if (mediaType.value === MediaType.MOVIE) {
			await trpc.movie.update.mutate({
				id: mediaData.value!.id,
				rating: newRating,
			});
		} else if (mediaType.value === MediaType.SERIE) {
			await trpc.serie.update.mutate({
				id: mediaData.value!.id,
				rating: newRating,
			});
		}
		rating.value = newRating ?? undefined;
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

		if (mediaType.value === MediaType.MOVIE) {
			await trpc.movie.update.mutate({
				id: mediaData.value!.id,
				rating: null,
			});
		} else if (mediaType.value === MediaType.SERIE) {
			await trpc.serie.update.mutate({
				id: mediaData.value!.id,
				rating: null,
			});
		}
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
</script>
