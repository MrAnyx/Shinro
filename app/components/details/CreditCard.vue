<template>
	<UCard :ui="{ body: 'p-0! h-full' }" variant="subtle">
		<NuxtLink class="flex flex-col h-full" :to="props.to" target="_blank">
			<ImageFallback :provider="props.imageProvider" :src="props.image" />

			<div class="p-2 flex-1 flex flex-col items-center justify-center">
				<p class="font-semibold text-center line-clamp-1">
					{{ name }}
				</p>
				<p class="text-sm text-muted text-center line-clamp-1">
					{{ character }}
				</p>
			</div>
		</NuxtLink>
	</UCard>
</template>

<script setup lang="ts">
import type { ConfiguredImageProviders } from "@nuxt/image";

import type { RouteLocationAsRelativeGeneric, RouteLocationAsPathGeneric } from "#vue-router";

const props = defineProps<{
	name?: string;
	character?: string;
	image?: string;
	imageProvider?: keyof ConfiguredImageProviders;
	to?: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric;
}>();

const name = computed(() => (props.name === "" || !props.name ? "No name" : props.name));
const character = computed(() => (props.character === "" || !props.character ? "No character" : props.character));
</script>
