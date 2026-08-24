<template>
	<!-- Title and tagline -->
	<div class="flex flex-col gap-y-1">
		<template v-if="isLoading">
			<USkeleton class="w-1/2 h-[32px] rounded-sm" />
			<USkeleton class="w-1/3 h-[24px] rounded-sm" />
		</template>
		<template v-else>
			<h1 class="font-bold text-4xl">
				{{ mediaData?.media.name ?? detailsData?.name ?? "No title available" }}
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
				v-if="detailsData?.first_air_date"
			>
				<NuxtTime :datetime="detailsData?.first_air_date" year="numeric" month="short" day="numeric" />
			</UBadge>

			<UBadge v-bind="airStatus" variant="subtle" />

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
				v-if="detailsData?.number_of_seasons"
			>
				{{ detailsData?.number_of_seasons }} seasons, {{ detailsData?.number_of_episodes }} episodes
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
import type { BadgeProps } from "@nuxt/ui";
import type { SerieWithMediaView } from "#shared/types/serie.models";
import type { TmdbSerieDetailsResponseSchema } from "#server/utils/tmdbSerie.models";
import type { z } from "zod";

interface Props {
	mediaData: SerieWithMediaView | null | undefined;
	detailsData: z.infer<typeof TmdbSerieDetailsResponseSchema> | null | undefined;
	isLoading: boolean;
	isExternal: boolean;
}

const props = defineProps<Props>();

const readMore = ref(false);

const airStatus = computed<BadgeProps | null>(() => {
	const firstAir = props.detailsData?.first_air_date;
	const lastAir = props.detailsData?.next_episode_to_air?.air_date ?? props.detailsData?.last_air_date;

	if (!firstAir) {
		return null;
	}

	try {
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const start = new Date(firstAir);
		const end = lastAir ? new Date(lastAir) : null;

		if (start > today) {
			// hasn't aired yet
			return {
				label: "Incoming",
				color: "warning",
				leadingIcon: "i-lucide-clock",
			};
		}
		if (!end || end >= today) {
			// started but not ended
			return {
				label: "Ongoing",
				color: "info",
				leadingIcon: "i-lucide-play",
			};
		}
		// fully aired
		return {
			label: "Released",
			color: "success",
			leadingIcon: "i-lucide-check",
		};
	} catch {
		return null;
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
