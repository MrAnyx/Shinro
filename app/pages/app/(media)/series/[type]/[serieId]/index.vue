<template>
	<UEmpty
		v-if="notFound"
		title="Series not found"
		description="This series is not available."
		icon="i-lucide-search-x"
	/>
	<div v-else class="flex flex-col lg:flex-row gap-8 w-full">
		<aside class="w-full lg:w-80 shrink-0">
			<UCard :ui="{ body: 'flex flex-col gap-y-4' }" variant="subtle">
				<ImageFallback
					provider="tmdb"
					:src="details?.details?.poster_path ?? undefined"
					:height="400"
					class="rounded-md"
					:loading="pending"
				/>
				<template v-if="pending">
					<USkeleton class="w-full h-[32px] rounded-sm" />
					<USkeleton class="w-full h-[32px] rounded-sm" />
				</template>
				<template v-else-if="details">
					<UButton
						v-if="!details.serie && isExternal"
						label="Add to My List"
						block
						leading-icon="i-lucide-plus"
						variant="subtle"
						color="success"
						:loading="adding"
						@click="add"
					/>
					<template v-else-if="details.serie">
						<UButton
							label="Remove from My List"
							block
							leading-icon="i-lucide-trash"
							variant="subtle"
							color="error"
							:loading="removing"
							@click="remove"
						/>
						<UButton
							label="Edit series"
							block
							leading-icon="i-lucide-square-pen"
							variant="subtle"
							color="info"
							:loading="editing"
							@click="edit"
						/>
						<StatusSelectMenu
							v-model="status"
							:type="MediaType.SERIE"
							variant="subtle"
							:loading="updatingStatus"
						/>
						<CollectionSelectMenu v-model="collectionIds" variant="subtle" :loading="updatingCollections" />
						<DetailsRatingPopover v-model="rating" variant="subtle" color="neutral" />
					</template>
				</template>
			</UCard>
		</aside>
		<main class="flex-1 min-w-0 flex flex-col gap-y-6">
			<DetailsTitleHeader
				:loading="pending"
				:title="details?.serie?.media.name ?? details?.details?.name ?? undefined"
				:subtitle="details?.details?.tagline ?? undefined"
			/>
			<div v-if="isExternal && details?.details" class="flex gap-2 flex-wrap">
				<AdultBadge :adult="details.details.adult ?? undefined" />
				<DetailsReleaseBadge :start-date="details.details.first_air_date ?? undefined" />
				<DetailsSeasonCountBadge
					v-if="details.details.number_of_seasons != null"
					:count="details.details.number_of_seasons"
				/>
				<DetailsEpisodeCountBadge
					v-if="details.details.number_of_episodes != null"
					:count="details.details.number_of_episodes"
				/>
				<VoteBadge
					:score="details.details.vote_average ?? undefined"
					:count="details.details.vote_count ?? undefined"
				/>
			</div>
			<DetailsOverview
				:loading="pending"
				:overview="details?.serie?.overview ?? details?.details?.overview ?? undefined"
			/>
			<DetailsGenreBadges v-if="isExternal" :loading="pending" :genres="details?.details?.genres" />
			<DetailsPersonalNote
				v-if="details?.serie?.media.note && !pending"
				:description="details.serie.media.note"
			/>
			<DetailsCreditCards
				v-if="isExternal"
				:credits="details?.credits"
				image-provider="tmdb"
				:loading="pending"
				:show-more-to="`https://www.themoviedb.org/tv/${routeId}/cast`"
				:credit-card-to-fn="(c: TmdbCredit) => `https://www.themoviedb.org/person/${c.id}`"
			/>
		</main>
	</div>
</template>

<script setup lang="ts">
import { useDebounceFn } from "@vueuse/core";

import { LazySerieFormModal } from "#components";
import { MediaStatus, MediaType } from "#prisma/enums";
import type { TmdbCredit } from "~/types/tmdb";

definePageMeta({
	validate: (route) =>
		typeof route.params.type === "string" &&
		(Object.values(MediaSourceTypes) as string[]).includes(route.params.type),
});

const route = useRoute();
const trpc = useTrpc();
const store = useSerieStore();
const toast = useStatusToast();
const modal = useOverlay().create(LazySerieFormModal);
const { openConfirmationModal } = useConfirmation();
const routeId = computed(() => route.params.serieId as string);
const isExternal = computed(() => route.params.type === MediaSourceTypes.external);
const notFound = ref(false);
const { data: details, pending } = useClientAsyncData<SerieDetails>(
	() =>
		isExternal.value
			? trpc.serie.getExternalDetails.query({ externalSerieId: routeId.value })
			: trpc.serie.getInternalDetails.query({ id: routeId.value }),
	{
		watch: [routeId, isExternal],
		onError: (err) => {
			if (getTRPCErrorCode(err) === "NOT_FOUND") {
				notFound.value = true;
			} else {
				toast.error(err, { description: "Failed to fetch series details" });
			}
		},
	},
);
watch([routeId, isExternal], () => {
	notFound.value = false;
});
const setSerie = (serie: Serie | null) => {
	if (details.value) {
		details.value = { ...details.value, serie, collections: serie ? details.value.collections : [] };
	}
};
const { loading: adding, execute: add } = useLoadingWrapper(() =>
	toast.withErrorToast(async () => {
		if (details.value?.serie) {
			return;
		}
		setSerie(await store.createSerieFromExternal({ externalSerieId: routeId.value }));
	}),
);
const { loading: removing, execute: remove } = useLoadingWrapper(() =>
	toast.withErrorToast(async () => {
		if (!details.value?.serie) {
			return;
		}
		const result = await openConfirmationModal(() => store.deleteSerie({ id: details.value!.serie!.id }), {
			icon: "i-lucide-trash",
			title: "Delete this series",
			message: "This also deletes its saved seasons and episodes. Press confirm to proceed.",
		});
		if (!result) {
			return;
		}
		setSerie(null);
		if (!isExternal.value) {
			await navigateTo("/app/series");
		}
	}),
);
const { loading: editing, execute: edit } = useLoadingWrapper(() =>
	toast.withErrorToast(async () => {
		if (!details.value?.serie) {
			return;
		}
		const result = await modal.open({ id: details.value.serie.id }).result;
		if (result && details.value) {
			setSerie(result.serie);
			details.value.collections = result.collections;
		}
	}),
);

const pendingStatus = usePendingValue<MediaStatus>();
const status = computed({
	get: () => (pendingStatus.isPending ? pendingStatus.value : (details.value?.serie?.media.status ?? undefined)),
	set: (value) => pendingStatus.track(value, updateStatus),
});
const { loading: updatingStatus, execute: updateStatus } = useLoadingWrapper((value: MediaStatus | undefined) =>
	toast.withErrorToast(async () => {
		if (!details.value?.serie) {
			return;
		}
		setSerie(await trpc.serie.update.mutate({ id: details.value.serie.id, status: value ?? null }));
	}),
);
const pendingCollections = usePendingValue<string[]>();
const collectionIds = computed({
	get: () =>
		pendingCollections.isPending ? pendingCollections.value! : (details.value?.collections.map((c) => c.id) ?? []),
	set: (value) => pendingCollections.track(value, updateCollections),
});
const { loading: updatingCollections, execute: updateCollections } = useLoadingWrapper((value: string[]) =>
	toast.withErrorToast(async () => {
		if (!details.value?.serie) {
			return;
		}
		details.value.collections = await trpc.media.updateCollections.mutate({
			id: details.value.serie.id,
			collectionIds: value,
		});
	}),
);
const pendingRating = usePendingValue<number>();
const rating = computed({
	get: () => (pendingRating.isPending ? pendingRating.value : (details.value?.serie?.media.rating ?? undefined)),
	set: (value) => pendingRating.track(value, updateRating),
});
const updateRating = useDebounceFn(
	(value: number | undefined) =>
		toast.withErrorToast(async () => {
			if (!details.value?.serie) {
				return;
			}
			setSerie(await trpc.serie.update.mutate({ id: details.value.serie.id, rating: value ?? null }));
		}),
	DEBOUNCE_TIMER,
);
</script>
