<template>
	<UCard class="w-[170px] shrink-0" :ui="{ body: 'p-0!' }" variant="subtle">
		<NuxtLink class="flex flex-col" :to="props.to" target="_blank">
			<ImageFallback :provider="props.imageProvider" :src="props.image" :height="210" />

			<div class="p-2">
				<p class="font-semibold text-center line-clamp-1">
					{{ props.name ?? "No name" }}
				</p>
				<p class="text-sm text-muted text-center line-clamp-1">
					{{ props.character ?? "No character" }}
				</p>
			</div>
		</NuxtLink>
	</UCard>
</template>

<script setup lang="ts">
import type { ConfiguredImageProviders } from "@nuxt/image";

import type { RouteLocationAsRelativeGeneric, RouteLocationAsPathGeneric } from "#vue-router";

const props = defineProps<{
	name?: string | null;
	character?: string | null;
	image?: string | null;
	imageProvider: keyof ConfiguredImageProviders | undefined;
	to?: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric;
}>();
</script>
