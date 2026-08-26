<template>
	<div class="flex flex-col gap-y-2">
		<template v-if="props.loading ?? false">
			<div class="flex flex-col gap-y-2">
				<USkeleton class="h-4 w-full rounded-sm" />
				<USkeleton class="h-4 w-full rounded-sm" />
				<USkeleton class="h-4 w-3/4 rounded-sm" />
			</div>
		</template>

		<template v-else>
			<p class="text-toned" :class="{ 'line-clamp-none': readMore, 'line-clamp-2': !readMore }">
				{{ props.overview ?? "No overview available" }}
			</p>
			<UButton
				label="Read more"
				variant="link"
				class="p-0 self-start"
				@click="toggleReadMore"
				v-if="props.overview"
				v-show="!readMore"
			/>
		</template>
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{
	loading?: boolean;
	overview?: string;
}>();

const readMore = ref(false);

const toggleReadMore = () => (readMore.value = !readMore.value);
</script>
