<template>
	<aside class="w-80">
		<UCard :ui="{ body: 'flex flex-col gap-y-4' }" variant="subtle">
			<!-- Image -->
			<ImageFallback
				provider="tmdb"
				:src="detailsData?.poster_path"
				:height="400"
				class="rounded-md"
				:loading="loading"
			/>

			<!-- Actions -->
			<template v-if="loading">
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
					v-if="!inMyList && external"
					@click="addMovie"
				/>

				<template v-else-if="inMyList">
					<UButton
						label="Remove from My List"
						block
						leading-icon="i-lucide-trash"
						variant="subtle"
						color="error"
						@click="removeMovie"
					/>

					<UButton
						label="Edit movie"
						block
						leading-icon="i-lucide-square-pen"
						variant="subtle"
						color="info"
						@click="editMovie"
					/>

					<StatusSelectMenu
						:loading="loading"
						@update:modelValue="updateStatus"
						variant="subtle"
						v-model="status"
					/>

					<USelectMenu
						:items="collections"
						v-model="selectedCollectionIds"
						:loading="loading"
						variant="subtle"
						multiple
						value-key="value"
						placeholder="Select some collections"
						leading-icon="i-lucide-folder"
						clear
						@clear="clearCollections"
						@update:model-value="updateMovieCollections"
					/>

					<DetailsRatingPopover v-model="rating" @update:model-value="updateRating" />
				</template>
			</template>
		</UCard>
	</aside>
</template>

<script setup lang="ts">
defineProps<{
	loading?: boolean;
}>();
</script>
