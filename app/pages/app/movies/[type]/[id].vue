<template>
	<div class="flex gap-x-8 w-full">
		<aside class="w-80">
			<UCard :ui="{ body: 'flex flex-col gap-y-4' }" variant="subtle">
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

				<UButton label="Add to My List" block leading-icon="i-lucide-plus" variant="subtle" color="success" />

				<UButton
					label="Remove from My List"
					block
					leading-icon="i-lucide-trash"
					variant="subtle"
					color="error"
				/>

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
						label="Set a rating"
						leading-icon="i-lucide-user-star"
					/>

					<template #content>
						<!-- class flex prevents the rating component from having a bigger bottom margin -->
						<div class="flex flex-col gap-y-2">
							<UInputRating :length="10" :step="0.5" :default-value="7.5" />
							<UButton label="Reset" variant="link" class="p-0 self-end" />
						</div>
					</template>
				</UPopover>
			</UCard>
		</aside>

		<main class="flex-1 min-w-0 flex flex-col gap-y-6">
			<div class="flex flex-col gap-y-1">
				<h1 class="font-bold text-4xl">{{ details?.title ?? "No title available" }}</h1>
				<h3 class="italic text-muted text-sm" v-if="details?.tagline">{{ details?.tagline }}</h3>
			</div>

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
					{{ Math.floor(details?.runtime / 60) }}:{{ (details?.runtime % 60).toString().padStart(2, "0") }}
				</UBadge>

				<UBadge
					:color="getRatingColor(details?.vote_average)"
					variant="subtle"
					leading-icon="i-lucide-star"
					v-if="details?.vote_average && details?.vote_count"
				>
					{{ details?.vote_average?.toFixed(1) }} ({{ details?.vote_count.toLocaleString() }} votes)
				</UBadge>

				<UBadge
					color="neutral"
					variant="subtle"
					leading-icon="i-lucide-list-video"
					v-if="details?.belongs_to_collection?.name"
				>
					{{ details?.belongs_to_collection?.name }}
				</UBadge>
			</div>

			<div class="flex flex-col gap-y-2">
				<p class="text-toned" :class="{ 'line-clamp-none': readMore, 'line-clamp-2': !readMore }">
					{{ details?.overview ?? "No overview available." }}
				</p>
				<UButton
					label="Read more"
					variant="link"
					class="p-0 self-start"
					@click="toggleReadMore"
					v-show="!readMore"
				/>
			</div>

			<div class="flex gap-2 flex-wrap">
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
				<UBadge v-else color="error" variant="subtle" leading-icon="i-lucide-tag-x">No genres available</UBadge>
			</div>

			<USeparator />

			<div>
				<h2 class="font-bold text-xl mb-3">Credits</h2>

				<div class="flex gap-x-3 overflow-x-auto pb-2">
					<template v-for="(actor, index) in actors" :key="index">
						<UCard class="w-[170px] shrink-0" :ui="{ body: 'p-0!' }" variant="subtle">
							<NuxtLink
								class="flex flex-col"
								:to="`https://www.themoviedb.org/person/${actor.id}`"
								target="_blank"
							>
								<NuxtImg
									provider="tmdb"
									:src="actor.profile_path"
									width="200"
									class="w-full h-[210px] object-cover"
									v-if="actor.profile_path"
								/>
								<NuxtImg
									src="https://placehold.co/200x200"
									class="w-full h-[210px] object-cover"
									v-else
								/>

								<div class="p-2">
									<p class="font-semibold text-center line-clamp-1">{{ actor.name }}</p>
									<p class="text-sm text-muted text-center line-clamp-1">{{ actor.character }}</p>
								</div>
							</NuxtLink>
						</UCard>
					</template>
					<UCard
						class="w-[170px] shrink-0"
						:ui="{ body: 'p-0! flex justify-center items-center h-full' }"
						variant="subtle"
					>
						<NuxtLink
							class="flex flex-col gap-y-2 items-center justify-center h-full"
							:to="`https://www.themoviedb.org/movie/${id}/cast`"
							target="_blank"
						>
							<UAvatar icon="i-lucide-external-link" size="xl" color="primary" />
							<span class="text-toned">View all</span>
							<span class="text-muted text-xs">{{ credits?.cast?.length ?? 0 }} cast members</span>
						</NuxtLink>
					</UCard>
				</div>
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
const genres = computed(() => details.value?.genres?.filter((g): g is { name: string } => !!g.name?.trim()) ?? []);
const actors = computed(() => credits.value?.cast?.slice(0, 20) ?? []);

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

const { data: credits, pending: loadingCredits } = useAsyncData(
	"credits",
	async () => await trpc.tmdb.credits.query({ id: id.value }),
);

const toggleReadMore = () => {
	readMore.value = !readMore.value;
};
</script>
