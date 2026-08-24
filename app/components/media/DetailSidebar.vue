<template>
	<aside class="w-80">
		<UCard :ui="{ body: 'flex flex-col gap-y-4' }" variant="subtle">
			<!-- Image -->
			<ImageFallback
				provider="tmdb"
				:src="imagePath"
				:height="400"
				class="rounded-md"
				:loading="isLoading"
			/>

			<!-- Actions -->
			<template v-if="isLoading">
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
					v-if="!isInMyList && isExternal"
					@click="$emit('add')"
				/>

				<template v-else-if="isInMyList">
					<UButton
						label="Remove from My List"
						block
						leading-icon="i-lucide-trash"
						variant="subtle"
						color="error"
						@click="$emit('remove')"
					/>

					<UButton
						label="Edit media"
						block
						leading-icon="i-lucide-square-pen"
						variant="subtle"
						color="info"
						@click="$emit('edit')"
					/>

					<StatusSelectMenu
						:loading="isLoading"
						@update:modelValue="$emit('update:status', $event)"
						variant="subtle"
						:model-value="status"
					/>

					<USelectMenu
						:items="collections"
						:model-value="selectedCollectionIds"
						:loading="isLoading"
						variant="subtle"
						multiple
						value-key="value"
						placeholder="Select some collections"
						leading-icon="i-lucide-folder"
						clear
						@clear="$emit('clear-collections')"
						@update:model-value="$emit('update:collections', $event)"
					/>

					<UPopover :ui="{ content: 'p-3!' }">
						<UButton
							color="neutral"
							variant="subtle"
							block
							:label="ratingButtonLabel"
							leading-icon="i-lucide-user-star"
						/>

						<template #content>
							<ClearableRating
								:model-value="rating"
								@update:model-value="(v) => $emit('update:rating', v ?? null)"
								@clear="$emit('clear-rating')"
							/>
						</template>
					</UPopover>
				</template>
			</template>
		</UCard>
	</aside>
</template>

<script setup lang="ts">
import type { SelectMenuItem } from "@nuxt/ui";
import type { MediaStatus } from "#prisma/enums";

interface Props {
	imagePath: string | null | undefined;
	isLoading: boolean;
	isExternal: boolean;
	isInMyList: boolean;
	status: MediaStatus | null | undefined;
	rating: number | null | undefined;
	collections: SelectMenuItem[];
	selectedCollectionIds: string[];
	ratingButtonLabel: string;
}

const props = defineProps<Props>();

defineEmits<{
	(e: "add"): void;
	(e: "remove"): void;
	(e: "edit"): void;
	(e: "update:status", status?: MediaStatus): void;
	(e: "update:rating", rating: number | null): void;
	(e: "clear-rating"): void;
	(e: "update:collections", collectionIds: string[]): void;
	(e: "clear-collections"): void;
}>();
</script>
