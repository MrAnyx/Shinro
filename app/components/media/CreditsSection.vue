<template>
	<div v-if="isExternal">
		<USeparator />

		<!-- Credits -->
		<div>
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
								:to="creditLink(actor.id)"
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
						v-if="(creditsData?.cast?.length ?? 0) > (maxCredits ?? 4)"
					>
						<NuxtLink
							class="flex flex-col gap-y-2 items-center justify-center h-full"
							:to="allCreditsLink"
							target="_blank"
						>
							<UAvatar icon="i-lucide-external-link" size="xl" color="primary" />
							<span class="text-toned">View all</span>
							<span class="text-muted text-xs">{{ creditsData?.cast?.length ?? 0 }} cast members</span>
						</NuxtLink>
					</UCard>
				</template>

				<p class="text-sm text-muted" v-else>No credits available</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { MediaType } from "#prisma/enums";

interface Credit {
	id: string;
	name: string | null;
	original_name: string | null;
	profile_path: string | null;
	character: string | null;
}

interface Props {
	creditsData: { cast: Credit[] | null } | null | undefined;
	isLoading: boolean;
	isExternal: boolean;
	mediaType: MediaType;
	id: string;
	maxCredits?: number;
}

const props = defineProps<Props>();

const maxCredits = props.maxCredits ?? 4;

const actors = computed(() => props.creditsData?.cast?.slice(0, maxCredits) ?? []);

const creditLink = (id: string) => {
	return `https://www.themoviedb.org/person/${id}`;
};

const allCreditsLink = computed(() => {
	const typeMap: Record<MediaType, string> = {
		[MediaType.MOVIE]: "movie",
		[MediaType.SERIE]: "tv",
		[MediaType.BOOK]: "book",
		[MediaType.MUSIC]: "music",
		[MediaType.GAME]: "game",
		[MediaType.SEASON]: "tv",
		[MediaType.EPISODE]: "tv",
	};
	return `https://www.themoviedb.org/${typeMap[props.mediaType] || 'movie'}/${props.id}/cast`;
});
</script>
