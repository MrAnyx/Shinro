<template>
	<!-- Title -->
	<div class="flex flex-col gap-y-1">
		<template v-if="isLoading">
			<USkeleton class="w-1/2 h-[32px] rounded-sm" />
			<USkeleton class="w-1/3 h-[24px] rounded-sm" />
		</template>
		<template v-else>
			<h1 class="font-bold text-4xl">
				{{ mediaData?.media.name ?? detailsData?.name ?? "No title available" }}
			</h1>
			<h3 class="italic text-muted text-sm" v-if="detailsData?.developer">
				Developed by {{ detailsData?.developer }}
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
				:color="getRatingColor(detailsData?.rating)"
				variant="subtle"
				leading-icon="i-lucide-star"
				v-if="detailsData?.rating"
			>
				{{ detailsData?.rating?.toFixed(1) }}
			</UBadge>

			<UBadge
				color="neutral"
				variant="subtle"
				leading-icon="i-lucide-users"
				v-if="detailsData?.players"
			>
				{{ detailsData?.players }} players
			</UBadge>

			<UBadge
				color="neutral"
				variant="subtle"
				leading-icon="i-lucide-clock"
				v-if="detailsData?.playtime"
			>
				{{ detailsData?.playtime }} hours
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

	<!-- Platforms -->
	<div class="flex gap-2 flex-wrap" v-if="isExternal && platforms.length > 0">
		<template v-if="isLoading">
			<USkeleton v-for="i in 3" :key="i" class="h-[24px] w-24 rounded-sm" />
		</template>
		<template v-else>
			<UBadge
				v-for="platform in platforms"
				:key="platform"
				color="primary"
				variant="subtle"
				leading-icon="i-lucide-monitor"
			>
				{{ platform }}
			</UBadge>
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
interface GameDetails {
	name: string | null;
	developer: string | null;
	release_date: string | null;
	rating: number | null;
	players: number | null;
	playtime: number | null;
	description: string | null;
	platforms: string[] | null;
	genres: string[] | null;
}

interface Props {
	mediaData: any | null | undefined;
	detailsData: GameDetails | null | undefined;
	isLoading: boolean;
	isExternal: boolean;
}

const props = defineProps<Props>();

const readMore = ref(false);

const genres = computed(() => props.detailsData?.genres ?? []);
const platforms = computed(() => props.detailsData?.platforms ?? []);

const toggleReadMore = () => (readMore.value = !readMore.value);

const getRatingColor = (rating: number | null | undefined) => {
	if (!rating) return "neutral";
	if (rating >= 4.5) return "success";
	if (rating >= 3.5) return "info";
	if (rating >= 2.5) return "warning";
	return "error";
};
</script>
