<template>
	<aside>
		<UCard :ui="{ body: 'flex flex-col gap-y-4' }" variant="subtle">
			<!-- Image -->
			<ImageFallback
				:provider="props.imageProvider"
				:src="props.image"
				:height="400"
				class="rounded-md"
				:loading="props.loading"
			/>

			<!-- Actions -->
			<template v-if="props.loading">
				<USkeleton class="w-full h-[32px] rounded-sm" />
				<USkeleton class="w-full h-[32px] rounded-sm" />
			</template>
			<template v-else>
				<UButton
					label="Add to My List"
					block
					leading-icon="i-lucide-plus"
					variant="subtle"
					color="success"
					v-if="!props.inMyList && props.external"
					@click="emit('add')"
				/>

				<template v-else-if="props.inMyList">
					<UButton
						label="Remove from My List"
						block
						leading-icon="i-lucide-trash"
						variant="subtle"
						color="error"
						@click="emit('remove')"
					/>

					<UButton
						label="Edit movie"
						block
						leading-icon="i-lucide-square-pen"
						variant="subtle"
						color="info"
						@click="emit('edit')"
					/>

					<StatusSelectMenu :loading="loading" variant="subtle" v-model="status" />

					<USelectMenu
						:items="internalCollectionsAvailable"
						v-model="collections"
						:loading="loading"
						variant="subtle"
						multiple
						value-key="value"
						placeholder="Select some collections"
						leading-icon="i-lucide-folder"
						clear
					/>

					<DetailsRatingPopover v-model="rating" />
				</template>
			</template>
		</UCard>
	</aside>
</template>

<script setup lang="ts">
import type { ConfiguredImageProviders } from "@nuxt/image";
import type { SelectMenuItem } from "@nuxt/ui";

import type { MediaStatus } from "#prisma/enums";

const rating = defineModel<number>("rating");
const status = defineModel<MediaStatus>("status");
const collections = defineModel<string[]>("collections");

const props = defineProps<{
	loading?: boolean;
	external: boolean;
	inMyList: boolean;
	image?: string | null;
	imageProvider?: keyof ConfiguredImageProviders;
	collectionsAvailable?: { id: string; name: string; favorite: boolean }[];
}>();

const emit = defineEmits<{
	(e: "add"): void;
	(e: "remove"): void;
	(e: "edit"): void;
}>();

const internalCollectionsAvailable = computed(
	() =>
		props.collectionsAvailable?.map(
			(x) =>
				({
					label: x.name,
					value: x.id,
					icon: x.favorite ? "i-ph-star-fill" : undefined,
					ui: {
						itemLeadingIcon: x.favorite ? "text-warning" : undefined,
					},
				}) as SelectMenuItem,
		) ?? [],
);
</script>
