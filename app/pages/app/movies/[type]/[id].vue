<template>
	<div class="flex gap-x-8 relative">
		<!-- Aside -->
		<aside class="w-80">
			<UCard :ui="{ body: 'flex flex-col gap-y-4' }">
				<div class="h-[400px] w-full rounded-md overflow-hidden">
					<USkeleton v-if="loadingDetails" class="w-full h-full" />
					<template v-else>
						<NuxtImg
							provider="tmdb"
							:src="details?.poster_path"
							width="500"
							class="object-cover w-full h-full"
							v-if="details?.poster_path"
						/>
						<NuxtImg src="https://placehold.co/500x750" class="object-contain" v-else />
					</template>
				</div>

				<USelectMenu
					:items="collections?.results.map((x) => x.name) ?? []"
					:loading="loadingCollections"
					variant="subtle"
					multiple
					placeholder="Select some collections"
					leading-icon="i-lucide-folder"
					clear
				/>

				<UPopover :ui="{ content: 'p-3!' }">
					<UButton
						color="neutral"
						variant="subtle"
						block
						:label="`Edit my rating (${'8.0' ?? 'N/A'})`"
						leading-icon="i-lucide-user-star"
					/>

					<template #content>
						<!-- class flex prevents the rating component from having a bigger bottom margin -->
						<div class="flex">
							<UInputRating :length="10" :step="0.5" :default-value="7.5" />
						</div>
					</template>
				</UPopover>
			</UCard>
		</aside>

		<main class="flex-1 flex flex-col gap-y-6">
			<h1 class="font-bold text-4xl">{{ details?.title ?? "No title available" }}</h1>

			<div class="flex gap-x-2">
				<UBadge color="neutral" variant="subtle" leading-icon="i-lucide-calendar" v-if="details?.release_date">
					<NuxtTime :datetime="details?.release_date" year="numeric" month="short" day="numeric" />
				</UBadge>

				<UBadge
					:color="isReleased ? 'success' : 'warning'"
					variant="subtle"
					:leading-icon="isReleased ? 'i-lucide-check' : 'i-lucide-clock'"
				>
					{{ isReleased ? "Released" : "Upcoming" }}
				</UBadge>

				<UBadge color="neutral" variant="subtle" leading-icon="i-lucide-clock" v-if="details?.runtime">
					{{ Math.floor(details?.runtime / 60) }}:{{ details?.runtime % 60 }}
				</UBadge>

				<UBadge
					:color="getRatingColor(details?.vote_average)"
					variant="subtle"
					leading-icon="i-lucide-star"
					v-if="details?.vote_average && details?.vote_count"
				>
					{{ details?.vote_average?.toFixed(1) }} ({{ details?.vote_count }})
				</UBadge>
			</div>

			<div class="flex flex-col gap-y-2">
				<p class="text-toned" :class="{ 'line-clamp-none': readMore, 'line-clamp-2': !readMore }">
					{{ details?.overview ?? "No overview available." }}
				</p>
				<UButton label="Read more" variant="link" class="p-0" @click="toggleReadMore" v-show="!readMore" />
			</div>
		</main>
	</div>
</template>
<script setup lang="ts">
import type { NuxtTime } from "#components";

definePageMeta({
	layout: "app",
	middleware: ["auth"],
	validate(route) {
		return typeof route.params.type === "string" && ["internal", "external"].includes(route.params.type);
	},
});

const route = useRoute();
const trpc = useTrpc();

const type = computed(() => route.params.type as "internal" | "external");
const id = computed(() => route.params.id as string);
const isExternal = computed(() => type.value === "external");
const isInternal = computed(() => type.value === "internal");
const isReleased = computed(() => {
	if (!details.value?.release_date) {
		return false;
	}
	return new Date(details.value.release_date) <= new Date();
});

const readMore = ref(false);

const { data: details, pending: loadingDetails } = useAsyncData("movie-details", async () => {
	if (isExternal.value) {
		return await trpc.tmdb.details.query({ id: id.value });
	} else {
		// return await trpc.movie.getMovie.query({ id: id.value });
	}
});

const { data: collections, pending: loadingCollections } = useAsyncData(
	"collections",
	async () => await trpc.collections.getAll.query({ page: 1 }),
);

const toggleReadMore = () => {
	readMore.value = !readMore.value;
};
</script>
