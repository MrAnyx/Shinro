<template>
	<!-- Title and tagline -->
	<div class="flex flex-col gap-y-1">
		<template v-if="isLoading">
			<USkeleton class="w-1/2 h-[32px] rounded-sm" />
			<USkeleton class="w-1/3 h-[24px] rounded-sm" />
		</template>
		<template v-else>
			<h1 class="font-bold text-4xl">
				{{ mediaData?.media.name ?? detailsData?.title ?? "No title available" }}
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
				{{ Math.floor(detailsData?.runtime / 60) }}:{{ (detailsData?.runtime % 60)?.toString()?.padStart(2, "0") }}
			</UBadge>

			<UBadge
				:color="getRatingColor(detailsData?.vote_average)"
				variant="subtle"
				leading-icon="i-lucide-star"
				v-if="detailsData?.vote_average && detailsData?.vote_count"
			>
				{{ detailsData?.vote_average?.toFixed(1) }} ({{ detailsData?.vote_count.toLocaleString() }} votes)
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
				{{ mediaData?.overview ?? detailsData?.overview ?? "No overview available" }}
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
</template>

<script setup lang="ts">
import type { MovieWithMediaView } from "#shared/types/movie.models";
import type { TmdbMovieDetailsResponseSchema } from "#server/utils/tmdbMovie.models";
import type { z } from "zod";

interface Props {
	mediaData: MovieWithMediaView | null | undefined;
	detailsData: z.infer<typeof TmdbMovieDetailsResponseSchema> | null | undefined;
	isLoading: boolean;
	isExternal: boolean;
}

const props = defineProps<Props>();

const readMore = ref(false);

const isReleased = computed(() => {
	if (!props.detailsData?.release_date) {
		return false;
	}

	try {
		return new Date(props.detailsData.release_date) <= new Date();
	} catch {
		return false;
	}
});

const genres = computed(() => {
	const g = props.detailsData?.genres?.filter((genre: any) => genre?.name?.trim()) ?? [];
	return g;
});

const toggleReadMore = () => (readMore.value = !readMore.value);

const getRatingColor = (rating: number | null | undefined) => {
	if (!rating) return "neutral";
	if (rating >= 8) return "success";
	if (rating >= 6) return "info";
	if (rating >= 4) return "warning";
	return "error";
};
</script>
