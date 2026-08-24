<template>
	<!-- Title and artist -->
	<div class="flex flex-col gap-y-1">
		<template v-if="isLoading">
			<USkeleton class="w-1/2 h-[32px] rounded-sm" />
			<USkeleton class="w-1/3 h-[24px] rounded-sm" />
		</template>
		<template v-else>
			<h1 class="font-bold text-4xl">
				{{ mediaData?.media.name ?? detailsData?.name ?? "No title available" }}
			</h1>
			<h3 class="italic text-muted text-sm" v-if="detailsData?.artists">
				By {{ detailsData?.artists?.join(', ') }}
			</h3>
		</template>
	</div>

	<!-- Details badges -->
	<div class="flex gap-x-2" v-if="isExternal">
		<template v-if="isLoading">
			<USkeleton v-for="i in 3" :key="i" class="h-[24px] w-24 rounded-sm" />
		</template>
		<template v-else>
			<UBadge
				color="neutral"
				variant="subtle"
				leading-icon="i-lucide-calendar"
				v-if="detailsData?.release_date"
			>
				<NuxtTime :datetime="detailsData?.release_date" year="numeric" month="short" day="numeric" />
			</UBadge>

			<UBadge
				:color="getRatingColor(detailsData?.popularity)"
				variant="subtle"
				leading-icon="i-lucide-star"
				v-if="detailsData?.popularity"
			>
				{{ Math.floor(detailsData?.popularity) }} popularity
			</UBadge>

			<UBadge
				color="neutral"
				variant="subtle"
				leading-icon="i-lucide-disc"
				v-if="detailsData?.total_tracks"
			>
				{{ detailsData?.total_tracks }} tracks
			</UBadge>

			<UBadge
				color="neutral"
				variant="subtle"
				leading-icon="i-lucide-clock"
				v-if="detailsData?.duration_ms"
			>
				{{ formatDuration(detailsData?.duration_ms) }}
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
				{{ mediaData?.media.overview ?? detailsData?.description ?? "No description available" }}
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
					:key="genre"
					color="primary"
					variant="subtle"
					leading-icon="i-lucide-tag"
				>
					{{ genre }}
				</UBadge>
			</template>
			<UBadge v-else color="error" variant="subtle" leading-icon="i-lucide-tag-x">
				No genres available
			</UBadge>
		</template>
	</div>
</template>

<script setup lang="ts">
interface MusicDetails {
	name: string | null;
	artists: string[] | null;
	release_date: string | null;
	popularity: number | null;
	total_tracks: number | null;
	duration_ms: number | null;
	description: string | null;
	genres: string[] | null;
}

interface Props {
	mediaData: any | null | undefined;
	detailsData: MusicDetails | null | undefined;
	isLoading: boolean;
	isExternal: boolean;
}

const props = defineProps<Props>();

const readMore = ref(false);

const genres = computed(() => props.detailsData?.genres ?? []);

const toggleReadMore = () => (readMore.value = !readMore.value);

const getRatingColor = (rating: number | null | undefined) => {
	if (!rating) return "neutral";
	if (rating >= 80) return "success";
	if (rating >= 60) return "info";
	if (rating >= 40) return "warning";
	return "error";
};

const formatDuration = (ms: number | null | undefined) => {
	if (!ms) return "";
	const seconds = Math.floor(ms / 1000);
	const minutes = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${minutes}:${secs.toString().padStart(2, "0")}`;
};
</script>
