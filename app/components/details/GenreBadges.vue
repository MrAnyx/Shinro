<template>
	<div class="flex gap-2 flex-wrap">
		<template v-if="props.loading ?? false">
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
					:label="genre"
				/>
			</template>
			<UBadge v-else color="error" variant="subtle" leading-icon="i-lucide-tag-x" label="No genres available" />
		</template>
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{
	loading?: boolean;
	genres: string[];
}>();
</script>
